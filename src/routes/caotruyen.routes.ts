import { Router, Response } from 'express';

const userRouter = Router();

userRouter.get('/caotruyen', async (req, res) => {
  const reponse = await fetch('https://123truyeni.com/than-dao-dan-ton/chuong-1');
  const data = await reponse.text();
  const listP = data.split('<p>');
  console.log(data);
  console.log(listP);
  res.send(data);
});

export default userRouter;
