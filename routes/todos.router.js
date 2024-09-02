import express from 'express';
import Todo from '../schemas/todo.schemas.js';

const router = express.Router();

/*** 할일 등록 API ***/
router.post('/todos', async(req, res, next) => {
    // 1. 클라이언트로 부터 받아온 value 데이터를 가져온다.
    const {value} = req.body;

    // 1-5. 만약, 클라이언트가 value 데이터를 전달하지 않았을 때,
    // 클라이언트에게 에러 메시지를 전달한다.
    if(!value) {
        return res
            .status(400)
            .json({ errorMessage: '해야할 일 데이터가 존재하지 않습니다.' });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    // findOne = 1개의 데이터만 조회한다.
    // sort = 정렬한다. -> 어떤 컬럼을?
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();

    // 3. 만약 존재한다면 현재 해야 할 일을 +1 하고, order 데이터가 존재하지 않다면, 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야할 일 등록
    const todo = new Todo({value, order});
    await todo.save();

    // 5. 해야할 일을 클라이언트에게 반환한다.
    return res.status(201).json({todo: todo});
});

// 해야할 일 목록 조회 API
router.get('/todos', async(req, res, next) => {
    // 1. 해야할 일 목록 조회를 진행한다.
    const todos = await Todo.find().sort('-order').exec();

    // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
    return res.status(200).json({todos});
})

export default router;