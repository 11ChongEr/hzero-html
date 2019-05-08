/**
 * 上传按钮组件.
 *
 * @date: 2018-7-13
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Upload, Icon, notification } from 'hzero-ui';
import { remove, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import {
  getAccessToken,
  getResponse,
  getAttachmentUrl,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { removeUploadFile } from '../../services/api';

notification.config({
  placement: 'bottomRight',
});

export default class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      fileList: null,
    };
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.fileList.length > 0 && state.fileList == null) {
  //     return {
  //       fileList: props.fileList,
  //     };
  //   }
  //   return state;
  // }

  setFileList(fileList) {
    if (fileList) {
      this.setState({
        fileList,
      });
    }
  }

  @Bind()
  uploadData(file) {
    const { bucketName, uploadData, bucketDirectory } = this.props;
    const data = uploadData ? uploadData(file) : {};
    const directory = isUndefined(bucketDirectory) ? {} : { directory: bucketDirectory };
    return {
      bucketName,
      fileName: file.name,
      ...directory,
      ...data,
    };
  }

  @Bind()
  onChange({ file, fileList }) {
    const { single = false, tenantId, bucketName, bucketDirectory } = this.props;
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed === true) {
        this.onUploadError(file, fileList);
      } else {
        this.onUploadSuccess(file, fileList);
        if (single) {
          list = [
            {
              uid: file.uid,
              name: file.name,
              url: getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory),
              thumbUrl: getAttachmentUrl(file.response, bucketName, tenantId, bucketDirectory),
            },
          ];
        } else {
          list = fileList.map(f => {
            if (f.uid === file.uid) {
              // f.url = file.response;
              // eslint-disable-next-line
              f.url = getAttachmentUrl(f.response, bucketName, tenantId, bucketDirectory);
              // f.url = `${HZERO_FILE}/v1${
              //   !isUndefined(tenantId) ? `/${tenantId}/` : '/'
              // }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
              //   !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
              // }url=${f.response}`;
            }
            return f;
          });
        }
      }
    } else if (file.status === 'error') {
      this.onUploadError(file, fileList);
      list = fileList.filter(f => {
        return f.status !== 'error';
      });
    }

    this.setState({
      fileList: list,
    });
  }

  @Bind()
  beforeUpload(file) {
    const { fileType, fileSize = 10 * 1024 * 1024 } = this.props;
    if (fileType && fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType,
          })
          .d(`上传文件类型必须是: ${fileType}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (!file.type) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl.get('hzero.common.upload.error.type.null').d('上传文件类型缺失，请检查类型'),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  @Bind()
  onRemove(file) {
    const { onRemove, bucketName, onRemoveSuccess, single = false, tenantId } = this.props;
    const { fileList } = this.state;
    if (onRemove) {
      return onRemove(file);
    } else {
      return removeUploadFile({
        tenantId,
        bucketName,
        urls: [file.url],
      }).then(res => {
        if (getResponse(res)) {
          if (onRemoveSuccess) {
            onRemoveSuccess();
          }

          if (single) {
            this.setState({
              fileList: [],
            });
          } else {
            remove(fileList, n => n.uid === file.uid);
            this.setState({
              fileList,
            });
          }
          return true;
        }
        return false;
      });
    }
  }

  onUploadSuccess(file, fileList) {
    const { onUploadSuccess } = this.props;
    if (onUploadSuccess) onUploadSuccess(file, fileList);
  }

  onUploadError(file, fileList) {
    const { onUploadError } = this.props;
    let showTip = true;
    if (onUploadError) {
      showTip = onUploadError(file, fileList) !== false;
    }
    if (showTip) {
      notification.error({
        message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        description: file.response.message,
      });
    }
  }

  @Bind()
  changeFileList(fileList) {
    const { bucketName, bucketDirectory, tenantId } = this.props;
    if (fileList) {
      return fileList.map(res => {
        return {
          ...res,
          url: getAttachmentUrl(res.url, bucketName, tenantId, bucketDirectory),
        };
      });
    }
  }

  render() {
    const {
      fileList,
      fileType,
      fileSize,
      single,
      text = intl.get('hzero.common.upload.txt').d('上传'),
      listType = 'picture',
      bucketName,
      onUploadSuccess,
      onUploadError,
      viewOnly = false,
      showRemoveIcon = true,
      docType,
      ...otherProps
    } = this.props;
    const accessToken = getAccessToken();
    const changedFileList = this.changeFileList(fileList);
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const acceptFileType =
      fileType && fileType.indexOf(',') === -1 ? fileType.split(';').join(',') : fileType;

    let uploadButton;
    if (listType === 'picture-card') {
      uploadButton = (
        <div>
          <Icon style={{ fontSize: '32px', color: '#999' }} type="plus" />
        </div>
      );
    } else {
      uploadButton = (
        <Button>
          <Icon type="upload" /> {text}
        </Button>
      );
    }
    const tenantId = getCurrentOrganizationId();
    const action = `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/multipart${
      isUndefined(docType) ? '' : `?docType=${docType}`
    }`;
    return (
      <Upload
        name="file"
        accept={acceptFileType}
        fileList={this.state.fileList || changedFileList}
        data={this.uploadData}
        action={action}
        headers={headers}
        onChange={this.onChange}
        listType={listType}
        beforeUpload={this.beforeUpload}
        onRemove={this.onRemove}
        showUploadList={{ showRemoveIcon: !viewOnly && showRemoveIcon }}
        {...otherProps}
      >
        {!viewOnly && uploadButton}
      </Upload>
    );
  }
}
