import multer from 'multer'
import path from 'path'
import fs from 'fs'
import moment from 'moment'

// 设置动态目录
const dynamicDestination = function(req, file, cb) {
  // 这里的 `directory` 是接口传递的动态目录，可以根据你的需求进行修改
  // const directory = req.body.directory;
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
  app.get('/api/attachment/**', async (req, res) => {
    try {
      const filePath = `./attachment/${req.params[0]}`; // 构建文件路径
      res.setHeader('Content-Type', 'application/octet-stream');
      fs.access(filePath, fs.constants.F_OK, error => {
        if (error) {
          res.status(500).send('文件不存在：');
          // 执行适当的错误处理操作，而不是停止服务
        } else {
          // 创建文件流并传递给响应对象
          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(res);
        }
      });
    } catch (error) {
      res.status(500).send('文件读取报错');
    }
  });
  // 临时文件存储，用来做未保存文件的预览
  app.post("/api/upload/tmp", upload.single("file"), async (req, res)=>{
    res.send({
      code: 1000,
      data: `/api/${req.file.path}`
    });
  })
  //使用uploadFile中间件
  app.post('/api/upload/agreement', upload.array('files'), function(req, res, next) {
    res.send({
      code: 1000,
      data: req.body.uids.map((item, index) => {
        return {
          uid: item,
          path: `/api/${req.files[index].path}`
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
          path: `/api/${req.files[index].path}`
        }
      })
    });
  });

  app.post('/api/upload/market', upload.array('files'), function(req, res, next) {
    res.send({
      code: 1000,
      data: req.body.uids.map((item, index) => {
        return {
          uid: item,
          path: `/api/${req.files[index].path}`
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
          path: `/api/${req.files[index].path}`
        }
      })
    });
  });
}