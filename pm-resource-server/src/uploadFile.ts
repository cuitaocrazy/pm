import multer from 'multer'
import path from 'path'
import fs from 'fs'
import moment from 'moment'
import { ObjectId } from 'mongodb'
import { Attachment } from './mongodb'

// 设置动态目录
const dynamicDestination = function(req, file, cb) {
  // 这里的 `directory` 是接口传递的动态目录，可以根据你的需求进行修改
  // const directory = req.body.directory;
  console.log(req.body)
  let timeStr = moment(Date.now()).format("YYYY-MM-DD");
  const directory = `./attachment/${req.url.split('/').pop()}${req.body.directory ? req.body.directory : '/'}${timeStr}/`;
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  cb(null, directory);
};

// 设置存储引擎
const storage = multer.diskStorage({
  destination: dynamicDestination,
  filename: function(req, file, cb) {
    let filename = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    cb(null, filename);
  }
});
const upload = multer({ storage: storage });

export default (app, express) => {
  app.use('/attachment/', express.static('./attachment/'))
  // 临时文件存储，用来做未保存文件的预览
  app.post("/api/upload/tmp", upload.single("file"), async (req, res)=>{
    res.send({
      code: 1000,
      data: `http://${req.get('Host')}/${req.file.path}`
    });
  })
  //使用uploadFile中间件
  app.post('/api/upload/agreement', upload.array('files'), function(req, res, next) {
    res.send({
      code: 1000,
      data: req.body.uids.map((item, index) => {
        return {
          uid: item,
          path: `http://${req.get('Host')}/${req.files[index].path}`
        }
      })
    });
  });

  app.post('/api/upload/active', upload.array('files'), function(req, res, next) {
    res.send({
      code: 1000,
      data: req.body.uids.map((item, index) => {
        return {
          uid: item,
          path: `http://${req.get('Host')}/${req.files[index].path}`
        }
      })
    });
  });

  app.post('/api/upload/knowledge', upload.array('files'), function(req, res, next) {
    res.send({
      code: 1000,
      data: req.body.uids.map((item, index) => {
        return {
          uid: item,
          path: `http://${req.get('Host')}/${req.files[index].path}`
        }
      })
    });
  });
}