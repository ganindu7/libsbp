/**
 * Copyright (C) 2015 Swift Navigation Inc.
 * Contact: Joshua Gross <josh@swift-nav.com>
 * This source is subject to the license found in the file 'LICENSE' which must
 * be distributed together with this source. All other rights reserved.
 *
 * THIS CODE AND INFORMATION IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND,
 * EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A PARTICULAR PURPOSE.
 */

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var yaml = require('js-yaml');
var decode = require(path.resolve(__dirname, '../sbp/')).decode;
var utils = require('./utils');

var yamlDir = path.resolve(__dirname, '../../spec/tests/yaml/swiftnav/sbp');
var yamlFiles = fs.readdirSync(yamlDir);

describe('test packages based on YAML descriptors', function () {
  yamlFiles.map(function (filename) {
    var fullpath = path.resolve(yamlDir, filename);

    describe(filename, function () {
      var yamlConfig = yaml.safeLoad(fs.readFileSync(fullpath));
      yamlConfig.tests.map(function (testSpec, i) {
        describe('test spec '+i, function () {
          var msg;
          it('should parse binary sbp and payload', function () {
            msg = decode(new Buffer(testSpec['raw_packet'], 'base64'));
          });
          it('should have correct SBP fields', function () {
            utils.verifyFields(testSpec.sbp, msg.sbp);
          });
          it('should have correct payload fields', function () {
            utils.verifyFields(testSpec.msg.fields, msg.fields);
          });
          it('should serialize back to binary properly', function () {
            assert.equal(msg.toBase64(), testSpec['raw_packet']);
          });
          it('should serialize back to JSON properly', function () {
            assert.deepEqual(JSON.parse(msg.toJSON()), JSON.parse(testSpec['raw_json']));
          });
        });
      });
    });
  });
});

describe('test unknown msg type', function () {
  it('should pass SBP message along without decoding payload', function () {
    var framedMessage = [0x55, 0xf0, 0xff, 0xcc, 0x04, 0x14, 0x70, 0x3d, 0xd0, 0x18, 0xcf, 0xef, 0xff, 0xff, 0xef, 0xe8, 0xff, 0xff, 0xf0, 0x18, 0x00, 0x00, 0x00, 0x00, 0x05, 0x00, 0x43, 0x94];
    var msg = decode(new Buffer(framedMessage));
    assert.deepEqual(msg.messageType, "raw");
  });
});
