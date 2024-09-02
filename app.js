import express from 'express';
import connect from './schemas/index.js';
import TodosRouter from './routes/todos.router.js';
import ErrorHandlerMiddleware from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json()); // 미들웨어 등록
app.use(express.urlencoded({ extended: true }));

// static Middleware, express.static()을 사용하여 정적 파일을 제공합니다.
// 해당하는 프론트앤드 파일을 서빙합니다.
// ./assets위치에 있는 모든 파일을 서빙할 겁니다.
app.use(express.static('./assets'));

app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl, ' - ', new Date());
  next();
});


const router = express.Router();

router.get('/', (req, res) => {
  return res.json({ message: 'Hi!' });
});

// 해당하는 router를 전역미들웨어로 등록해서 /api가 붙은 경우에만 접근 가능하게 만들었다.
app.use('/api', [router, TodosRouter]);

// 에러 핸들링 미들웨어를 등록합니다.
app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});