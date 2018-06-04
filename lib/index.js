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
    domain_name: {
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
    // init qiniu config
    const qiniuConfig = new qiniu.conf.Config();
    // init form uploader
    const formUploader = new qiniu.form_up.FormUploader(qiniuConfig);
    const putExtra = new qiniu.form_up.PutExtra();
    // init bucket manager 
    const bucketManager = new qiniu.rs.BucketManager(mac, qiniuConfig);
    const publicDownloadDomainName = "http://" + config.domain_name;

    return {
      upload: (file) => {
        const readStream = intoStream(file.buffer);
        return new Promise((resolve, reject) => {
          // use file.hash as key
          formUploader.putStream(uploadToken, file.hash, readStream, putExtra, (respErr, respBody, respInfo) => {
            if (respErr) {
              reject(respErr);
            }
            if (respInfo.statusCode == 200) {
              file.url = bucketManager.publicDownloadUrl(publicDownloadDomainName, respBody.key);
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
      delete: (file) => {
        return new Promise((resolve, reject) => {
          bucketManager.delete(config.bucket_name, file.hash, (err, respBody, respInfo) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        });
      }
    };
  }
};
