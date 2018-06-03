'use strict';

/**
 * Module dependencies
 */

// Public node modules.
/* eslint-disable import/no-unresolved */
/* eslint-disable prefer-template */
const qiniu = require('qiniu');

module.exports = {
  provider: 'qiniu',
  name: 'Qiniu',
  auth: {
    bucket_name: {
      label: 'Bucket name',
      type: 'text'
    },
    api_key: {
      label: 'API Access Key',
      type: 'text'
    },
    api_secret: {
      label: 'API Secret Key',
      type: 'text'
    }
  },
  init: (config) => {
    // init auth object
    const accessKey = config.api_key;
    const secretKey = config.api_secret;
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    // init the upload token by Bucket
    const options = {
        scope: config.bucket_name,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken=putPolicy.uploadToken(mac);

    return {
      upload (file) {
        return new Promise((resolve, reject) => {
        //   const upload_stream = cloudinary.uploader.upload_stream({}, (err, image) => {
        //     if (err) {
        //       return reject(err);
        //     }
        //     file.public_id = image.public_id;
        //     file.url = image.secure_url;
        //     resolve();
        //   });
        //   intoStream(file.buffer).pipe(upload_stream);
        // });
        resolve();
        });
      },
      async delete (file) {
        try {
        //   const response = await cloudinary.uploader.destroy(file.public_id + '3', {
        //     invalidate: true
        //   });
        //   if (response.result !== 'ok') {
        //     throw {
        //       error: new Error(response.result)
        //     };
        //   }
        } catch (error) {
          throw error.error;
        }
      }
    };
  }
};
