const db = require("./db");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getPost = async (event) => {
  const respone = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
    };
    const { Item } = await db.send(new GetItemCommand(params));
    console.log({ Item });
    respone.body = JSON.stringify({
      message: "Successful retrieved post.",
      data: Item ? unmarshall(Item) : {},
      rawData: Item,
    });
  } catch (e) {
    console.error(e);
    respone.statusCode = 500;
    respone.body = JSON.stringify({
      message: "failed to get post.",
      errorMsg: e.message,
      erroStacks: e.stack,
    });
  }
  return respone;
};

const createPost = async (event) => {
  const respone = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {}),
    };
    const createResult = await db.send(new PutItemCommand(params));
    respone.body = JSON.stringify({
      message: "Successful create post.",
      createResult,
    });
  } catch (e) {
    console.error(e);
    respone.statusCode = 500;
    respone.body = JSON.stringify({
      message: "failed to create post.",
      errorMsg: e.message,
      erroStacks: e.stack,
    });
  }
  return respone;
};

const updatePost = async (event) => {
  const respone = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    const createResult = await db.send(new PutItemCommand(params));
    const objKeys = Object.keys(body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const updateResult = await db.send(new UpdateItemCommand(params));
    respone.body = JSON.stringify({
      message: "Successful updated post.",
      updateResult,
    });
  } catch (e) {
    console.error(e);
    respone.statusCode = 500;
    respone.body = JSON.stringify({
      message: "failed to update post.",
      errorMsg: e.message,
      erroStacks: e.stack,
    });
  }
  return respone;
};

const deletePost = async (event) => {
  const respone = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ postId: event.pathParameters.postId }),
    };
    const deleteResult = await db.send(new DeleteItemCommand(params));
    console.log({ Item });
    respone.body = JSON.stringify({
      message: "Successful delete post.",
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    respone.statusCode = 500;
    respone.body = JSON.stringify({
      message: "failed to delete post.",
      errorMsg: e.message,
      erroStacks: e.stack,
    });
  }
  return respone;
};

const getAllPost = async (event) => {
  const respone = { statusCode: 200 };

  try {
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    console.log({ Item });
    respone.body = JSON.stringify({
      message: "Successful retrieved post.",
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    respone.statusCode = 500;
    respone.body = JSON.stringify({
      message: "failed to get post.",
      errorMsg: e.message,
      erroStacks: e.stack,
    });
  }
  return respone;
};

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  getAllPost,
};
