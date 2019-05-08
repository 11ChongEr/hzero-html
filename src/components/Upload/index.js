import React, { PureComponent } from 'react';
import { Modal, Icon, Spin, Alert, Tag, Button } from 'hzero-ui';
import { isFunction, isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Viewer from 'react-viewer';
import 'react-viewer/dist/index.css';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import {
  getResponse,
  getAttachmentUrl,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';

import { queryFileList, removeFile, queryUUID } from '../../services/api';

import UploadButton from './UploadButton';

const DEFAULT_BUCKET_NAME = 'spfm-comp';

// const previewModalStyle = {
//   maxWidth: '50vw',
//   maxHeight: '50vh',
// };

// const previewImageStyle = {
//   maxWidth: '100%',
//   maxHeight: '100%',
// };

/**
 * 使用UUID上传组件
 * @extends {Component} - React.Component
 * @reactProps {?String} bucketName - 附件桶
 * @reactProps {?String} bucketDirectory - 目录名称
 * @reactProps {?Object} attachmentUUID - 传入的UUID，如果不传入，组件可生成
 * @reactProps {?Object} currentData - 当前行数据
 * @reactProps {?function} afterOpenUploadModal - 展开modal后触发的方法
 * @reactProps {?Boolean} hasTemplate - 是否有附件模版
 * @reactProps {?String} templateAttachmentUUID - 附件模版UUID,通过 Tooltip 提示用户附件模版
 * @reactProps {?function} removeCallback - 删除文件后回调
 * @reactProps {?function} onCloseUploadModal - 关闭弹框时调用方法
 * @reactProps {?Boolean} viewOnly - 是否只读
 * @return React.element
 */
export default class Upload extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      modalLoading: false,
      templateList: [],
      fileList: [],
      previewVisible: false,
      previewImages: [],
      attachmentUUID: '',
    };
  }

  upload;

  componentDidMount() {
    const { bucketName = DEFAULT_BUCKET_NAME, attachmentUUID, tenantId } = this.props;
    if (attachmentUUID) {
      queryFileList({
        tenantId,
        bucketName,
        attachmentUUID,
      }).then(fileList => {
        if (getResponse(fileList)) {
          this.setState({
            fileList: this.changeFileList(fileList),
          });
        }
      });
    }
  }

  /**
   * 如果attachmentUUID变化 请求新UUID中的文件列表
   * @param {Object} nextProps 下个状态的props
   */
  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { bucketName = DEFAULT_BUCKET_NAME, tenantId } = this.props;
    if (this.props.attachmentUUID !== nextProps.attachmentUUID) {
      queryFileList({ tenantId, bucketName, attachmentUUID: nextProps.attachmentUUID }).then(
        fileList => {
          if (getResponse(fileList)) {
            this.setState({
              fileList: this.changeFileList(fileList),
            });
          }
        }
      );
    }
  }

  /**
   *格式化已经上传的文件列表
   *
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  @Bind()
  changeFileList(response) {
    const { bucketName = DEFAULT_BUCKET_NAME, bucketDirectory, tenantId } = this.props;
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: getAttachmentUrl(res.fileUrl, bucketName, tenantId, bucketDirectory),
      };
    });
  }

  /**
   *打开modal后返回方法，可返回当前行数据和UUID
   *
   * @memberof UploadModal
   */
  @Bind()
  handleAfterOpenModal() {
    const { afterOpenUploadModal } = this.props;
    const { attachmentUUID } = this.state;
    if (isFunction(afterOpenUploadModal)) {
      afterOpenUploadModal(attachmentUUID);
    }
  }

  @Bind()
  closeUploadModal() {
    const { onCloseUploadModal } = this.props;
    this.setState({
      visible: false,
    });
    if (onCloseUploadModal) {
      onCloseUploadModal();
    }
  }

  @Bind()
  async openUploadModal() {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      attachmentUUID,
      templateAttachmentUUID,
      tenantId,
    } = this.props;
    const { attachmentUUID: stateAttachmentUUID } = this.state;
    this.setState({
      visible: true,
      loading: true,
    });

    let state = { loading: false };
    if (templateAttachmentUUID) {
      const tempalteList = await queryFileList({
        tenantId,
        bucketName,
        attachmentUUID: templateAttachmentUUID,
      });
      if (getResponse(tempalteList)) {
        state = {
          ...state,
          templateList: tempalteList,
        };
      }
    }

    let uuid = attachmentUUID || stateAttachmentUUID;
    if (!uuid) {
      const response = await queryUUID({ tenantId });
      if (response) {
        uuid = response.content;
      }
    }
    state = {
      ...state,
      attachmentUUID: uuid,
    };

    const fileList = await queryFileList({
      tenantId,
      bucketName,
      attachmentUUID: uuid,
    });
    if (getResponse(fileList)) {
      state = {
        ...state,
        fileList: this.changeFileList(fileList),
      };
      if (this.upload) {
        this.upload.setFileList(this.changeFileList(fileList));
      }
    }

    this.setState(state, () => {
      this.handleAfterOpenModal();
    });
  }

  /**
   *Ref
   *
   * @param {*} upload
   * @memberof UploadModal
   */
  @Bind()
  onRef(upload) {
    this.upload = upload;
  }

  /**
   *获取其他参数
   *
   * @returns
   * @memberof UploadModal
   */
  @Bind()
  uploadData() {
    return {
      attachmentUUID: this.state.attachmentUUID,
    };
  }

  /**
   *上传成功后调用方法
   *
   * @param {*} file 文件信息
   * @param {*} fileList 文件列表
   * @memberof UploadModal
   */
  @Bind()
  onUploadSuccess(_, fileList) {
    const { uploadSuccess } = this.props;
    if (uploadSuccess) {
      uploadSuccess();
    }
    this.setState({
      fileList,
    });
    if (this.props.onChange) {
      this.props.onChange(this.state.attachmentUUID);
    }
  }

  /**
   * 图片预览
   * @param {*} file
   */
  @Bind()
  handlePreview(file) {
    this.setState({
      previewImages: [
        {
          src: file.url || file.thumbUrl,
          alt: '', // 由于下方会显示 alt 所以这里给空字符串 file.name,
        },
      ],
      previewVisible: true,
    });
  }

  /**
   * 图片预览取消
   */
  @Bind()
  handlePreviewCancel() {
    this.setState({
      previewImages: [],
      previewVisible: false,
    });
  }

  /**
   *删除文件
   *
   * @param {*} file 文件
   * @memberof UploadModal
   */
  @Bind()
  removeFile(file) {
    const { removeCallback, bucketName = DEFAULT_BUCKET_NAME, tenantId } = this.props;
    const { attachmentUUID, fileList } = this.state;
    const splitDatas = (file.url && file.url.split('=')) || [];
    const fileUrl = splitDatas[splitDatas.length - 1];
    this.setState({
      modalLoading: true,
    });
    return removeFile({
      tenantId,
      bucketName,
      attachmentUUID,
      urls: [fileUrl],
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          modalLoading: false,
          fileList: fileList.filter(list => list.url !== file.url),
        });
        if (removeCallback) {
          removeCallback();
        }
        return true;
      } else {
        this.setState({
          modalLoading: false,
        });
        return false;
      }
    });
  }

  render() {
    const {
      bucketName = DEFAULT_BUCKET_NAME,
      bucketDirectory,
      icon = 'upload',
      filesNumber = '',
      showFilesNumber = true,
      hasTemplate,
      multiple = true,
      viewOnly = false,
      btnText = viewOnly
        ? intl.get('hzero.common.upload.view').d('查看附件')
        : intl.get('hzero.common.upload.text').d('上传附件'),
      description,
      onChange,
      tenantId,
      btnProps = {},
      title = intl.get('hzero.common.upload.modal.title').d('附件'),
      docType,
      ...otherProps
    } = this.props;
    const {
      visible,
      modalLoading,
      previewVisible,
      previewImages,
      fileList,
      templateList = [],
      loading = false,
    } = this.state;

    const uploadLinkButton = (
      <React.Fragment>
        {isEmpty(btnProps) ? (
          <a onClick={this.openUploadModal}>
            {icon && <Icon type={icon} />}
            {btnText}
          </a>
        ) : (
          <Button onClick={this.openUploadModal} {...btnProps}>
            {btnText}
          </Button>
        )}
        {showFilesNumber && ((filesNumber && filesNumber !== 0) || fileList.length > 0) && (
          <Tag color="#108ee9" style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}>
            {filesNumber && filesNumber !== 0 ? filesNumber : fileList.length}
          </Tag>
        )}
      </React.Fragment>
    );

    let descriptionBlock = null;
    if (hasTemplate || description) {
      const templateLinks = templateList.map(tpl => {
        return (
          <Tag>
            <a
              style={{ color: '#108ee9' }}
              href={tpl.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tpl.fileName}
            </a>
          </Tag>
        );
      });
      const message = (
        <React.Fragment>
          <div>{description}</div>
          <div>
            {hasTemplate && (
              <span>
                {intl.get('hzero.common.upload.template').d('附件模板')}: {templateLinks}{' '}
              </span>
            )}
          </div>
        </React.Fragment>
      );

      descriptionBlock = (
        <Alert
          showIcon
          message={message}
          style={{ marginRight: '8px', marginBottom: '15px' }}
          type="info"
        />
      );
    }

    const action = `${HZERO_FILE}/v1${
      isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'
    }files/attachment/multipart${isUndefined(docType) ? '' : `?docType=${docType}`}`;

    const modalContent = (
      <React.Fragment>
        {loading && (
          <div style={{ textAlign: 'center', padding: '30px 50px' }}>
            <Spin />
          </div>
        )}
        <div style={{ display: loading ? 'none' : '' }}>
          {descriptionBlock}
          <Spin spinning={modalLoading}>
            <UploadButton
              viewOnly={viewOnly}
              multiple={multiple}
              listType="picture-card"
              onPreview={this.handlePreview}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              onRef={this.onRef}
              uploadData={this.uploadData}
              tenantId={tenantId}
              action={action}
              onRemove={this.removeFile}
              onUploadSuccess={this.onUploadSuccess}
              showUploadList={{
                removePopConfirmTitle: intl
                  .get('hzero.common.message.confirm.delete')
                  .d('是否删除此条记录?'),
                showRemoveIcon: !viewOnly,
              }}
              {...otherProps}
            />
          </Spin>
        </div>
      </React.Fragment>
    );

    return (
      <React.Fragment>
        {uploadLinkButton}
        <Modal
          visible={visible}
          title={title}
          width={610}
          footer={null}
          onCancel={this.closeUploadModal}
        >
          {modalContent}
        </Modal>
        <Viewer
          noImgDetails
          noNavbar
          scalable={false}
          changeable={false}
          visible={previewVisible}
          onClose={this.handlePreviewCancel}
          images={previewImages}
        />
      </React.Fragment>
    );
  }
}
