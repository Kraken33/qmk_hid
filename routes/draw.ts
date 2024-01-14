import express, {Request} from 'express';
import pipe from 'lodash/fp/pipe';
import flatten from 'lodash/fp/flatten'
import { UInt8t } from '../types/common';
import bytes from '../modules/bytes';
import oled from '../modules/oled';
import hid from '../modules/hid';
import { QMKCommands } from '../types/command';
const router = express.Router();

/* GET users listing. */
router.post ('/', async function(req: Request<{}, {}, UInt8t[]>, res, next) {
  const {body} = req;
  
  const result = await pipe(
    bytes.chunk(31),
    oled.addOledBufferCommandId2Chunks,
    oled.addRenderBufferCommandPackage,
    flatten,
    hid.send
  )(body);
  res.send('respond with a resource');
});

export default router;
