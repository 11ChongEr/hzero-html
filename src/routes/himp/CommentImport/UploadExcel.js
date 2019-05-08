/**
 *通用导入模块
 * @since 2018-9-12
 * @version 0.0.1
 * @author  fushi.wang <fushi.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Upload, Button } from 'hzero-ui';
import { isObject, isString } from 'lodash';
import { Bind } from 'lodash-decorators';

import request from 'utils/request';
import { API_HOST } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

const viewButtonPrompt = 'himp.comment.view.button';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

export default class UploadExcel extends React.Component {
  state = {
    uploadLoading: false,
  };

  @Bind()
  beforeUpload(file) {
    const { prefixPatch, templateCode, param = {}, success = e => e } = this.props;
    const formData = new FormData();
    const organizationId = getCurrentOrganizationId();
    formData.append('excel', file, file.name);
    if (prefixPatch && templateCode) {
      const url = `${API_HOST}${prefixPatch}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
        query: param,
        body: formData,
        responseType: 'text',
      })
        .then(res => {
          if (isJSON(res) && JSON.parse(res).failed) {
            notification.error({ description: JSON.parse(res).message });
          } else if (res) {
            success(res);
          }
        })
        .finally(() => {
          this.setState({
            uploadLoading: false,
          });
        });
    }
    return false;
  }

  render() {
    const { uploadLoading } = this.state;
    const { disabled = false } = this.props;
    const uploadProps = {
      accept: '.xls,.xlsx',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      style: {
        margin: '0 12px',
      },
    };
    return (
      <Upload {...uploadProps}>
        <Button className="label-btn" icon="upload" loading={uploadLoading} disabled={disabled}>
          {intl.get(`${viewButtonPrompt}.importData`).d('上传Excel')}
        </Button>
      </Upload>
    );
  }
}
