/**
 * notice - 公告管理-详情页面
 * @date: 2018-9-20
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { Button, Form, Input, Row, Col, DatePicker, Select, Cascader } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import UploadModal from 'components/Upload/index';
import TinymceEditor from 'components/TinymceEditor';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;

@formatterCollections({ code: 'hptl.notice' })
@Form.create({ fieldNameProp: null })
@connect(({ loading, notice }) => ({
  notice,
  createNoticeLoading: loading.effects['notice/createNotice'],
  updateNoticeLoading: loading.effects['notice/updateNotice'],
  publicNoticeLoading: loading.effects['notice/publicNotice'],
  organizationId: getCurrentOrganizationId(),
}))
export default class NoticeDetail extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      attachmentUuid: '',
    };
  }

  componentDidMount() {
    const {
      dispatch,
      match: {
        params: { noticeId },
      },
    } = this.props;
    dispatch({
      type: 'notice/init',
    });
    if (noticeId !== 'create') {
      this.queryNoticeDetail({ noticeId }).then(res => {
        if (res && res.attachmentUuid) {
          this.handleUuid(res);
          dispatch({
            type: 'notice/queryFileList',
            payload: { attachmentUUID: res.attachmentUuid, bucketName: 'notice' },
          });
        }
      });
    } else {
      dispatch({
        type: 'notice/updateState',
        payload: {
          noticeDetail: {
            noticeContent: {
              noticeBody: '',
            },
          },
        },
      });
      this.handleUuid();
    }
  }

  /**
   * @function fetchNoticeDetail - 查询公告详情
   * @param {object} params - 查询参数
   */
  queryNoticeDetail(params = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { noticeId },
      },
    } = this.props;
    return dispatch({
      type: 'notice/queryNotice',
      payload: { organizationId, noticeId, ...params },
    });
  }

  /**
   * 文件上传
   */
  @Bind()
  uploadImage(payload, file) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'notice/uploadImage',
      payload,
      file,
    });
  }

  /**
   * 监听富文本编辑
   * @param {object} dataSource - 编辑的数据
   */
  @Bind()
  onRichTextEditorChange(dataSource) {
    const {
      dispatch,
      notice: { noticeDetail },
    } = this.props;
    const { noticeContent = {} } = noticeDetail;
    dispatch({
      type: 'notice/updateState',
      payload: {
        noticeDetail: {
          ...noticeDetail,
          noticeContent: {
            ...noticeContent,
            noticeBody: dataSource,
          },
        },
      },
    });
  }

  /**
   * @function handleCreateNotice - 保存公告信息
   */
  @Bind()
  handleCreateNotice() {
    const {
      dispatch,
      form,
      organizationId,
      notice: { noticeDetail = {} },
      history,
      match: {
        params: { noticeId },
      },
    } = this.props;
    const { noticeContent = {} } = noticeDetail;
    const { noticeBody = '' } = noticeContent;
    let params = {};
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        if (!noticeBody) {
          return notification.warning({
            message: intl
              .get('hptl.notice.view.message.alert.noticeContentRequired')
              .d('请输入公告内容'),
          });
        }
        if (noticeDetail.noticeId) {
          params = {
            type: 'notice/updateNotice',
            payload: {
              ...noticeDetail,
              ...fieldsValue,
              startDate: moment(fieldsValue.startDate).format(DEFAULT_DATE_FORMAT),
              endDate:
                (fieldsValue.endDate && moment(fieldsValue.endDate).format(DEFAULT_DATE_FORMAT)) ||
                '',
              attachmentUuid: this.state.attachmentUuid,
              receiverTypeCode: fieldsValue.receiverTypeCode[0],
              noticeCategoryCode: fieldsValue.receiverTypeCode[1] || '',
              noticeContent,
            },
          };
        } else {
          params = {
            type: 'notice/createNotice',
            payload: {
              ...fieldsValue,
              startDate: moment(fieldsValue.startDate).format(DEFAULT_DATE_FORMAT),
              endDate:
                (fieldsValue.endDate && moment(fieldsValue.endDate).format(DEFAULT_DATE_FORMAT)) ||
                '',
              attachmentUuid: this.state.attachmentUuid,
              receiverTypeCode: fieldsValue.receiverTypeCode[0],
              noticeCategoryCode: fieldsValue.receiverTypeCode[1] || '',
              tenantId: organizationId,
              statusCode: 'DRAFT',
              noticeContent: { noticeBody, tenantId: organizationId },
            },
          };
        }
        dispatch(params).then(res => {
          if (res) {
            notification.success();
            dispatch({
              type: 'notice/updateState',
              payload: { noticeDetail: res },
            });
            if (noticeId === 'create') {
              history.push(`/hptl/notices/detail/${res.noticeId}`);
            }
          }
        });
      }
    });
  }

  /**
   * @function handlePublicNotice - 发布公告信息
   */
  @Bind()
  handlePublicNotice() {
    const {
      dispatch,
      organizationId,
      notice: {
        noticeDetail: { noticeId },
      },
    } = this.props;
    dispatch({
      type: 'notice/publicNotice',
      payload: { organizationId, noticeId },
    }).then(res => {
      if (res) {
        notification.success();
        this.queryNoticeDetail({ noticeId: res.noticeId });
      }
    });
  }

  /**
   * handleUuid - 获取uuid
   * @param {object} data - 报价模板头数据
   *  @param {string} data.attachmentUuid - 文件上传下载所需的uuid
   */
  @Bind()
  handleUuid(data = {}) {
    if (data.attachmentUuid) {
      this.setState({
        attachmentUuid: data.attachmentUuid,
      });
    }
  }

  /**
   * changeFileList - 格式化已经上传的文件列表
   * @param {array} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   */
  @Bind()
  changeFileList(response) {
    return response.map((res, index) => {
      return {
        uid: index,
        name: res.fileName,
        status: 'done',
        url: res.fileUrl,
      };
    });
  }

  /**
   * removeFile - 删除文件
   * @param {object} file - 删除的文件对象
   */
  @Bind()
  removeFile(file) {
    const {
      dispatch,
      notice: { noticeDetail },
    } = this.props;
    dispatch({
      type: 'notice/removeFile',
      payload: {
        bucketName: 'notice',
        attachmentUUID: this.state.attachmentUuid || noticeDetail.attachmentUuid,
        urls: [file.url],
      },
    }).then(res => {
      if (res) {
        notification.success();
      }
    });
  }

  @Bind()
  renderForm() {
    const {
      form,
      notice: { noticeType = [], langList = [], noticeDetail = {}, noticeCascaderType = [] },
    } = this.props;
    const { attachmentUuid } = this.state;
    const {
      noticeContent = {},
      title,
      noticeTypeCode,
      receiverTypeCode,
      noticeCategoryCode,
      lang = 'zh_CN',
      startDate,
      endDate,
    } = noticeDetail;
    const { noticeBody = '' } = noticeContent;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 16,
      },
    };
    const staticTextProps = {
      content: noticeBody,
      onChange: this.onRichTextEditorChange,
    };
    return (
      <Form>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get('hptl.notice.model.notice.title').d('公告标题')}
              {...formItemLayout}
            >
              {getFieldDecorator('title', {
                initialValue: title,
                rules: [
                  { type: 'string', required: true, message: '请输入公告标题' },
                  {
                    max: 100,
                    message: intl.get('hzero.common.validation.max', {
                      max: 100,
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      const emoji = new RegExp(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g);
                      if (value && emoji.test(value)) {
                        callback(
                          new Error(
                            intl
                              .get('hptl.notice.view.validation.titleNotContainEmoji')
                              .d('标题不能含有表情符号')
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('hptl.notice.model.notice.receiverTypeMeaning').d('公告类型')}
              {...formItemLayout}
            >
              {getFieldDecorator('noticeTypeCode', {
                initialValue: noticeTypeCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hptl.notice.model.notice.receiverTypeMeaning').d('公告类型'),
                    }),
                  },
                ],
              })(
                <Select>
                  {noticeType.map(item => {
                    return (
                      <OptGroup label={item.meaning} key={item.value}>
                        {item.children &&
                          item.children.map(items => {
                            return (
                              <Option value={items.value} key={items.value}>
                                {items.meaning}
                              </Option>
                            );
                          })}
                      </OptGroup>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get('hptl.notice.model.notice.receiverTypeCode').d('发布对象类别')}
              {...formItemLayout}
            >
              {getFieldDecorator('receiverTypeCode', {
                initialValue: receiverTypeCode ? [receiverTypeCode, noticeCategoryCode] : [],
                rules: [
                  {
                    type: 'array',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hptl.notice.model.notice.receiverTypeCode').d('发布对象类别'),
                    }),
                  },
                ],
              })(
                <Cascader
                  allowClear={false}
                  options={noticeCascaderType}
                  fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                  placeholder=""
                  expandTrigger="hover"
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('hptl.notice.model.notice.lang').d('语言')}
              {...formItemLayout}
            >
              {getFieldDecorator('lang', {
                initialValue: lang,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hptl.notice.model.notice.lang').d('语言'),
                    }),
                  },
                ],
              })(
                <Select>
                  {langList.map(item => {
                    return (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get('hzero.common.date.active.from').d('有效日期从')}
              {...formItemLayout}
            >
              {getFieldDecorator('startDate', {
                initialValue: startDate && moment(startDate, DEFAULT_DATE_FORMAT),
                rules: [
                  {
                    type: 'object',
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hzero.common.date.active.from').d('有效日期从'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  allowClear={false}
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={current => {
                    if (form.getFieldValue('endDate')) {
                      return moment(current).isAfter(form.getFieldValue('endDate'), 'day');
                    } else {
                      return moment(current).isBefore(moment(form.getFieldValue('endDate')), 'day');
                    }
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('hzero.common.date.active.to').d('有效日期至')}
              {...formItemLayout}
            >
              {getFieldDecorator('endDate', {
                initialValue: endDate && moment(endDate, DEFAULT_DATE_FORMAT),
              })(
                <DatePicker
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={current => {
                    return (
                      form.getFieldValue('startDate') &&
                      moment(current).isBefore(form.getFieldValue('startDate'), 'day')
                    );
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get('hzero.common.upload.text').d('上传附件')}
              {...formItemLayout}
            >
              <UploadModal attachmentUUID={attachmentUuid} bucketName="notice" />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <FormItem
              label={intl.get('hptl.notice.model.notice.noticeContent').d('公告内容')}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              {getFieldDecorator('noticeContent', {
                initialValue: noticeBody,
              })(<TinymceEditor {...staticTextProps} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      updateNoticeLoading,
      createNoticeLoading,
      publicNoticeLoading,
      notice: {
        noticeDetail,
        noticeDetail: { statusCode = '' },
      },
    } = this.props;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hptl.notice.view.message.title.detail').d('公告明细')}
          backPath="/hptl/notices/list"
        >
          <Button
            icon="save"
            type="primary"
            loading={noticeDetail.noticeId ? updateNoticeLoading : createNoticeLoading}
            onClick={this.handleCreateNotice}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {(statusCode === 'DRAFT' || statusCode === 'PUBLISHED') && (
            <Button icon="rocket" loading={publicNoticeLoading} onClick={this.handlePublicNotice}>
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
          )}
        </Header>
        <Content>{this.renderForm()}</Content>
      </React.Fragment>
    );
  }
}
