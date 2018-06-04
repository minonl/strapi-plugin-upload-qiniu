'use strict';

/**
 * Module dependencies
 */

// Public node modules.
/* eslint-disable import/no-unresolved */
/* eslint-disable prefer-template */
const qiniu = require('qiniu');
const intoStream = require('into-stream');

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
    },
    domain_name:{
        label: 'Domain Name',
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
    const uploadToken = putPolicy.uploadToken(mac);

    const qiniuConfig = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();

    return {
      upload (file) {
        console.log(file)
        const readStream = intoStream(file.buffer);
        return new Promise((resolve, reject) => {
            formUploader.putStream(uploadToken, null, readStream, putExtra, function(respErr, respBody, respInfo) {
                if (respErr) {
                    reject(respErr);
                }
                console.log(respBody);
                if (respInfo.statusCode == 200) {
                    // file.public_id = respBody.;
                    file.url = "http://"+config.domain_name+"/"+respBody.key;
                    resolve();
                } else {
                    reject({
                        code: respInfo.statusCode,
                        body: respBody
                    })
                }
            });
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
