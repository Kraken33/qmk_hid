import express, {Request} from 'express';
import { UInt8t } from '../types/common';

const router = express.Router();

router.post ('/', async function(req: Request<{}, {}, UInt8t[]>, res, next) {
  const {body} = req;
});

export default router;
