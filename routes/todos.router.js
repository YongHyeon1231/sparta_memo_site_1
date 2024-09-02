import express from 'express';
import Joi from 'joi';
import Todo from '../schemas/todo.schemas.js';

const router = express.Router();

/**
 * 1. `value` 데이터는 **필수적으로 존재**해야한다.
2. `value` 데이터는 **문자열 타입**이어야한다.
3. `value` 데이터는 **최소 1글자 이상**이어야한다.
4. `value` 데이터는 **최대 50글자 이하**여야한다.
5. 유효성 검사에 실패했을 때, 에러가 발생해야한다. 
*/
const createdTodoSchema = Joi.object({
  value: Joi.string().min(1).max(50).required(),
});

/*** 할일 등록 API ***/
router.post('/todos', async (req, res, next) => {
  try {
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    if (!value) {
      return res.status(400).json({ errorMessage: '해야할 일 데이터가 존재하지 않습니다.' });
    }

    const todoMaxOrder = await Todo.findOne().sort('-order').exec();

    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    const todo = new Todo({ value, order });
    await todo.save();

    return res.status(201).json({ todo: todo });
  } catch (error) {
    // 발생한 에러를 다음 에러 처리 미들웨어로 전달합니다.
    next(error);
  }
});

// 해야할 일 목록 조회 API
router.get('/todos', async (req, res, next) => {
  // 1. 해야할 일 목록 조회를 진행한다.
  const todos = await Todo.find().sort('-order').exec();

  // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
  return res.status(200).json({ todos });
});

// 해야할 일 순서 변경, 완료 / 해제, 내용 변경 API
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  // 클라이언트가 전달한 순서, 완료 여부, 내용 데이터를 가져옵니다.
  const { order, done, value } = req.body;

  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
  }

  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }

    currentTodo.order = order;
  }

  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  if (value) {
    currentTodo.value = value;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

// 할 일 삭제 API
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;

  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
  }

  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;
