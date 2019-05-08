/**
 * Storage 文件存储配置页面
 * @date: 2018-7-25
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Radio, Input, Spin, Cascader } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import { Content, Header } from 'components/Page';
import Checkbox from 'components/Checkbox';
import { Permissions, FormItem, Button } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { isTenantRoleLevel } from 'utils/utils';

const RadioGroup = Radio.Group;
const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 8,
  },
};

@formatterCollections({ code: 'hfile.storage' })
@Form.create({ fieldNameProp: null })
@connect(({ loading, storage, user }) => ({
  fetchDefaultLoading: loading.effects['storage/fetchDefaultStorage'],
  fetchStorageLoading: loading.effects['storage/fetchStorage'],
  saveLoading: loading.effects['storage/updateStorage'],
  storage,
  user,
}))
export default class Storage extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'storage/init' });
    this.fetchDefaultStorage();
  }

  /**
   * fetchDefaultStorage - 获取默认配置
   */
  fetchDefaultStorage(params = {}) {
    const {
      dispatch,
      storage: { tenantId },
    } = this.props;
    return dispatch({
      type: 'storage/fetchDefaultStorage',
      payload: { tenantId, ...params },
    });
  }

  /**
   * fetchStorage - 获取文件
   * @param {string} params.text - 选择的租户值
   * @param {object} params.record - 选择的租户行数据
   */
  fetchStorage(params = {}) {
    const {
      dispatch,
      storage: { tenantId },
    } = this.props;
    dispatch({
      type: 'storage/fetchStorage',
      payload: { tenantId, ...params },
    });
  }

  /**
   * handleChangeOrg - 租户切换
   * @param {string} text - 选择的租户值
   * @param {object} record - 选择的租户行数据
   */
  @Bind()
  handleChangeOrg(text, record) {
    const { dispatch, form } = this.props;
    form.resetFields();
    dispatch({
      type: 'storage/updateState',
      payload: { tenantId: record.tenantId },
    });
    this.fetchDefaultStorage({
      tenantId: record.tenantId,
    });
  }

  /**
   * handleSelectStorage - 监听不同的存储类型切换
   * @param {object} e - 事件对象
   */
  @Bind()
  handleSelectStorage(e) {
    const { dispatch, form } = this.props;
    form.resetFields();
    dispatch({
      type: 'storage/updateState',
      payload: {
        storageData: {},
      },
    });
    this.fetchStorage({ storageType: e.target.value });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 保存文件服务配置
   */
  @Bind()
  handleSaveStorage() {
    const { dispatch, form, storage } = this.props;
    const { storageData, tenantId } = storage;
    const { storageConfigId } = storageData;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const params = storageConfigId
          ? {
              ...storageData,
              ...fieldsValue,
              storageConfigId: storageConfigId || '',
              accessControl: fieldsValue.accessControl ? fieldsValue.accessControl[1] : '',
              tenantId,
            }
          : {
              ...fieldsValue,
              storageConfigId: storageConfigId || '',
              accessControl: fieldsValue.accessControl ? fieldsValue.accessControl[1] : '',
              tenantId,
            };
        dispatch({
          type: 'storage/updateStorage',
          payload: params,
        }).then(res => {
          if (res) {
            form.resetFields();
            notification.success();
            this.fetchStorage({ storageType: fieldsValue.storageType });
          }
        });
      }
    });
  }

  render() {
    const {
      form,
      fetchDefaultLoading = false,
      fetchStorageLoading = false,
      saveLoading = false,
      user: {
        currentUser: { tenantName },
      },
      storage: { storageData = {}, serverProviderList = [] },
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      domain,
      endPoint,
      accessKeyId,
      accessKeySecret,
      appId,
      region,
      bucketPrefix,
      accessControl,
      storageType: sType = '1',
      defaultFlag = 1,
    } = storageData;
    const storageType = `${sType}`;
    const type = form.getFieldValue('storageType');
    return (
      <React.Fragment>
        <Header title={intl.get('hfile.storage.view.message.title').d('文件存储配置')}>
          <Button
            code={['hzero.file.storage.ps.default']}
            style={{ marginLeft: 10 }}
            type="primary"
            icon="save"
            loading={saveLoading}
            onClick={this.handleSaveStorage}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={this.handleReset}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          {!isTenantRoleLevel() && (
            <Lov
              className="page-head-operation"
              style={{ width: '200px' }}
              value="0"
              allowClear={false}
              textValue={tenantName}
              code="HPFM.TENANT"
              onChange={(text, record) => {
                this.handleChangeOrg(text, record);
              }}
            />
          )}
        </Header>
        <Content>
          <Spin spinning={fetchDefaultLoading || fetchStorageLoading}>
            <Form>
              <FormItem
                label={intl.get('hfile.storage.model.storage.storageType').d('存储类型')}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
              >
                {getFieldDecorator('storageType', {
                  initialValue: storageType,
                })(
                  <RadioGroup onChange={this.handleSelectStorage}>
                    <Radio value="1">
                      {intl.get('hfile.storage.view.message.storageType.ali').d('阿里云')}
                    </Radio>
                    <Radio value="2">
                      {intl.get('hfile.storage.view.message.storageType.huawei').d('华为云')}
                    </Radio>
                    <Radio value="3">
                      {intl.get('hfile.storage.view.message.storageType.minio').d('Minio')}
                    </Radio>
                    <Radio value="4">
                      {intl.get('hfile.storage.view.message.storageType.tencent').d('腾讯云')}
                    </Radio>
                    <Radio value="7">
                      {intl.get('hfile.storage.view.message.storageType.jingdong').d('京东云')}
                    </Radio>
                    <Radio value="8">
                      {intl.get('hfile.storage.view.message.storageType.jingdong').d('AWS')}
                    </Radio>
                    <Radio value="9">
                      {intl.get('hfile.storage.view.message.storageType.baidu').d('百度云')}
                    </Radio>
                    <Radio value="6">本地存储</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              {((type !== '2' && type !== '3' && type !== '7' && type !== '8') || type === '6') && (
                <FormItem
                  label={intl.get('hfile.storage.model.storage.Domain').d('域名（Domain）')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('domain', {
                    initialValue: domain,
                    rules: [
                      {
                        required: type !== '4',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hfile.storage.model.storage.Domain').d('域名（Domain）'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              )}
              <FormItem
                code={['hzero.file.storage.ps.default']}
                label={
                  type === '6'
                    ? '存储路径'
                    : intl.get('hfile.storage.model.storage.EndPoint').d('EndPoint')
                }
                {...formItemLayout}
              >
                {getFieldDecorator('endPoint', {
                  initialValue: endPoint,
                  rules: [
                    {
                      type: 'string',
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name:
                          type === '6'
                            ? '存储路径'
                            : intl.get('hfile.storage.model.storage.EndPoint').d('EndPoint'),
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
              {type !== '6' && (
                <React.Fragment>
                  <FormItem
                    label={intl.get('hfile.storage.model.storage.AccessKeyId').d('AccessKeyId')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('accessKeyId', {
                      initialValue: accessKeyId,
                      rules: [
                        {
                          type: 'string',
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hfile.storage.model.storage.AccessKeyId')
                              .d('AccessKeyId'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </FormItem>
                  <FormItem
                    label={intl
                      .get('hfile.storage.model.storage.AccessKeySecret')
                      .d('AccessKeySecret')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('accessKeySecret', {
                      initialValue: accessKeySecret,
                      rules: [
                        {
                          type: 'string',
                          required: false,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('hfile.storage.model.storage.accessKeySecret')
                              .d('AccessKeySecret'),
                          }),
                        },
                      ],
                    })(
                      <Input
                        type="password"
                        placeholder={intl.get('hfile.common.validation.notChange').d('未更改')}
                      />
                    )}
                  </FormItem>
                </React.Fragment>
              )}
              {type === '4' && (
                <React.Fragment>
                  <FormItem
                    label={intl.get('hfile.storage.model.storage.AppId').d('AppId')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('appId', {
                      initialValue: appId,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hfile.storage.model.storage.AppId').d('AppId'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </FormItem>
                </React.Fragment>
              )}
              {(type === '4' || type === '7' || type === '8') && (
                <FormItem
                  label={intl.get('hfile.storage.model.storage.region').d('Bucket所属地区')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('region', {
                    initialValue: region,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hfile.storage.model.storage.region').d('Bucket所属地区'),
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              )}
              {type !== '6' && (
                <React.Fragment>
                  <Permissions code={['hzero.file.storage.ps.default']}>
                    <FormItem
                      label={intl
                        .get('hfile.storage.model.storage.accessControl')
                        .d('bucket权限控制')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('accessControl', {
                        initialValue: accessControl ? [storageType, accessControl] : [],
                        rules: [
                          {
                            type: 'array',
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hfile.storage.model.storage.accessControl')
                                .d('bucket权限控制'),
                            }),
                          },
                        ],
                      })(
                        <Cascader
                          placeholder=""
                          expandTrigger="hover"
                          allowClear={false}
                          options={serverProviderList.filter(item => {
                            if (type) {
                              return item.value === type;
                            } else {
                              return item;
                            }
                          })}
                          fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                        />
                      )}
                    </FormItem>
                    <FormItem label="bucket前缀" {...formItemLayout}>
                      {getFieldDecorator('bucketPrefix', {
                        initialValue: bucketPrefix,
                        rules: [
                          {
                            required: type !== '4',
                            message: intl.get('hzero.common.validation.notNull', {
                              name: 'bucket前缀',
                            }),
                          },
                        ],
                      })(<Input inputChinese={false} typeCase="lower" />)}
                    </FormItem>
                  </Permissions>
                </React.Fragment>
              )}
              <FormItem
                label={intl.get('hfile.storage.model.storage.defaultFlag').d('设置为默认')}
                {...formItemLayout}
              >
                {getFieldDecorator('defaultFlag', {
                  initialValue: defaultFlag,
                })(<Checkbox />)}
              </FormItem>
            </Form>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
