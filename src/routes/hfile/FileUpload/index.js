/**
 * fileUpload - 文件上传配置
 * @date: 2018-9-19
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Form, Input, Select, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, filter } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import Lov from 'components/Lov';
import { Pie } from 'components/Charts';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';

import TableList from './TableList';
import Drawer from './Drawer';
import styles from './index.less';

const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ fileUpload, loading, user }) => ({
  fileUpload,
  user,
  fetchFileLoading: loading.effects['fileUpload/queryFileList'],
  saveHeaderLoading: loading.effects['fileUpload/saveHeader'],
  saveDetailLoading:
    loading.effects['fileUpload/addConfigDetail'] || loading.effects['fileUpload/editConfigDetail'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hfile.fileUpload'] })
@Form.create({ fieldNameProp: null })
export default class FileUpload extends PureComponent {
  state = {
    visible: false,
    isCreate: false,
    tableRecord: {},
    nowTenantId: undefined, // 改变租户
    nowTenantName: undefined, // 租户名称
    newFileFormat: [], // 文件格式
  };

  componentDidMount() {
    this.queryFileList();
    this.queryFiletype();
    this.queryFileFormat();
    this.queryFileUnit();
  }

  /**
   * 获取文件列表
   *
   * @param {*} [params={}]
   * @memberof FileUpload
   */
  @Bind()
  queryFileList() {
    const { dispatch, tenantId } = this.props;
    this.setState({
      nowTenantId: tenantId,
    });
    dispatch({
      type: 'fileUpload/queryFileList',
      payload: { tenantId },
    });
  }

  /**
   * 获取当前租户下的文件列表
   */
  @Bind()
  queryNowTenantFileList(params = {}) {
    const { dispatch } = this.props;
    const { nowTenantId } = this.state;
    dispatch({
      type: 'fileUpload/queryFileList',
      payload: { page: isEmpty(params) ? {} : params, tenantId: nowTenantId },
    });
  }

  /**
   * 获取文件类型
   *
   * @memberof FileUpload
   */
  @Bind()
  queryFiletype() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileUpload/queryFiletype',
    });
  }

  /**
   * 获取文件格式
   *
   * @memberof FileUpload
   */
  @Bind()
  queryFileFormat() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileUpload/queryFileFormat',
    });
  }

  /**
   * 获取单位
   *
   * @memberof FileUpload
   */
  @Bind()
  queryFileUnit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileUpload/queryFileUnit',
    });
  }

  /**
   * 改变租户
   *
   * @param {*} val
   * @memberof FileUpload
   */
  @Bind()
  changeOrganizationId(val, item) {
    const { dispatch } = this.props;
    dispatch({
      type: 'fileUpload/queryFileList',
      payload: { tenantId: val },
    });
    this.setState({
      nowTenantId: val,
      nowTenantName: item.tenantName,
    });
  }

  /**
   * 打开新增模态框
   *
   * @memberof FileUpload
   */
  @Bind()
  showModal() {
    const {
      fileUpload: { fileFormatsList = [] },
    } = this.props;
    this.setState({
      visible: true,
      isCreate: true,
      newFileFormat: fileFormatsList,
    });
  }

  /**
   * 关闭模态框
   *
   * @memberof FileUpload
   */
  @Bind()
  closeModal() {
    this.setState({
      visible: false,
      isCreate: false,
      tableRecord: {},
    });
  }

  /**
   * 获取表格中的数据,打开编辑模态框
   *
   * @param {*} record
   * @memberof FileUpload
   */
  @Bind()
  getRecordData(record) {
    const {
      fileUpload: { fileFormatsList = [] },
    } = this.props;
    const { contentType } = record;
    const newFileFormat = filter(fileFormatsList, item => {
      return contentType.indexOf(item.parentValue) >= 0;
    });
    this.setState({
      tableRecord: record,
      visible: true,
      isCreate: false,
      newFileFormat,
    });
  }

  /**
   * 改变文件分类，设置文件格式状态
   * @param {*} newFileFormat
   */
  @Bind()
  changeFileFormats(newFileFormat) {
    this.setState({
      newFileFormat,
    });
  }

  // 保存头
  @Bind()
  handleSaveHeader() {
    const {
      dispatch,
      form,
      fileUpload: { fileData = {} },
    } = this.props;
    const { nowTenantId } = this.state;
    const {
      _token,
      objectVersionNumber,
      capacityConfigId,
      redisUsedCapacity,
      usedCapacity,
      listConfig = {},
    } = fileData;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'fileUpload/saveHeader',
          payload: {
            tenantId: nowTenantId,
            ...values,
            objectVersionNumber,
            capacityConfigId,
            _token,
          },
        }).then(res => {
          if (res) {
            notification.success();
            dispatch({
              type: 'fileUpload/updateState',
              payload: { fileData: { ...res, redisUsedCapacity, usedCapacity, listConfig } },
            });
          }
        });
      }
    });
  }

  /**
   * 新建文件上传详细配置
   *
   * @param {*} value
   * @memberof FileUpload
   */
  @Bind()
  handleAddConfigDetail(value) {
    const {
      dispatch,
      fileUpload: { pagination = {} },
    } = this.props;
    const { nowTenantId } = this.state;
    dispatch({
      type: 'fileUpload/addConfigDetail',
      payload: { tenantId: nowTenantId, ...value },
    }).then(res => {
      if (res) {
        this.closeModal();
        notification.success();
        this.queryNowTenantFileList(pagination);
      }
    });
  }

  /**
   * 编辑文件上传详细配置
   *
   * @param {*} value
   * @memberof FileUpload
   */
  @Bind()
  handleEditConfigDetail(value) {
    const {
      dispatch,
      fileUpload: { pagination = {} },
    } = this.props;
    const { nowTenantId } = this.state;
    dispatch({
      type: 'fileUpload/editConfigDetail',
      payload: { tenantId: nowTenantId, ...value },
    }).then(res => {
      if (res) {
        this.closeModal();
        notification.success();
        this.queryNowTenantFileList(pagination);
      }
    });
  }

  /**
   *  删除文件上传详细配置
   *
   * @param {*} values
   * @memberof FormManage
   */
  @Bind()
  handleDeleteConfigDetail(values) {
    const {
      dispatch,
      fileUpload: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'fileUpload/deleteConfigDetail',
      payload: values,
    }).then(res => {
      if (res) {
        this.queryNowTenantFileList(pagination);
        notification.success();
      }
    });
  }

  @Bind()
  renderForm() {
    const {
      fileUpload: { fileUnitList = [], fileData = {} },
      saveHeaderLoading,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const fileMaxUnitSelector = getFieldDecorator('storageUnit', {
      initialValue: fileData.storageUnit ? fileData.storageUnit : 'MB',
    })(
      <Select style={{ width: '65px' }}>
        {fileUnitList &&
          fileUnitList.map(item => (
            <Option value={item.value} key={item.value}>
              {item.meaning}
            </Option>
          ))}
      </Select>
    );
    const fileCapacityUnitSelector = getFieldDecorator('totalCapacityUnit', {
      initialValue: fileData.totalCapacityUnit ? fileData.totalCapacityUnit : 'MB',
    })(
      <Select style={{ width: '65px' }}>
        {fileUnitList &&
          fileUnitList.map(item => (
            <Option value={item.value} key={item.value}>
              {item.meaning}
            </Option>
          ))}
      </Select>
    );
    const pieTotal = `${
      fileData.redisUsedCapacity
        ? fileData.totalCapacityUnit === 'MB'
          ? Math.round(fileData.redisUsedCapacity / 1024 / 1024)
          : Math.round(fileData.redisUsedCapacity / 1024)
        : 0
    }/${fileData.totalCapacity ? fileData.totalCapacity : 0}(${
      fileData.totalCapacityUnit ? fileData.totalCapacityUnit : 'MB'
    })`;
    const piePercent =
      ((fileData.redisUsedCapacity
        ? fileData.totalCapacityUnit === 'MB'
          ? Math.round(fileData.redisUsedCapacity / 1024 / 1024)
          : Math.round(fileData.redisUsedCapacity / 1024)
        : 0) /
        (fileData.totalCapacity ? fileData.totalCapacity : 1)) *
      100;
    return (
      <Form>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get('hfile.fileUpload.model.fileUpload.totalCapacity').d('最大容量')}
              {...formItemLayout}
            >
              {getFieldDecorator('totalCapacity', {
                rules: [
                  {
                    min: 0,
                    pattern: /^\d+$/,
                    message: intl
                      .get('hfile.fileUpload.view.message.patternValidate')
                      .d('请输入大于等于0的整数'),
                  },
                ],
                initialValue: fileData.totalCapacity ? fileData.totalCapacity : null,
              })(<Input type="number" addonAfter={fileCapacityUnitSelector} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              label={intl.get('hfile.fileUpload.model.fileUpload.storageSize').d('文件大小限制')}
              {...formItemLayout}
            >
              {getFieldDecorator('storageSize', {
                rules: [
                  {
                    min: 0,
                    pattern: /^\d+$/,
                    message: intl
                      .get('hfile.fileUpload.view.message.patternValidate')
                      .d('请输入大于等于0的整数'),
                  },
                ],
                initialValue: fileData.storageSize ? fileData.storageSize : null,
              })(<Input type="number" addonAfter={fileMaxUnitSelector} />)}
            </Form.Item>
          </Col>
          <Col span={2} className={styles.buttonSave}>
            <Form.Item>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={() => {
                  this.handleSaveHeader();
                }}
                loading={saveHeaderLoading}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Form.Item>
          </Col>
          <Col span={4} className={styles.pie}>
            <Pie
              percent={piePercent}
              subTitle={intl
                .get('hfile.fileUpload.model.fileUpload.redisUsedCapacity')
                .d('已使用容量')}
              total={pieTotal}
              height={180}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      user: {
        currentUser: { organizationId, tenantName },
      },
      fileUpload: {
        fileData: { listConfig = {} },
        fileTypeList = [],
        fileFormatsList = [],
        fileUnitList = [],
        pagination = {},
      },
      fetchFileLoading,
      saveDetailLoading,
    } = this.props;
    const {
      visible,
      isCreate,
      tableRecord,
      newFileFormat = [],
      nowTenantId,
      nowTenantName,
    } = this.state;
    const drawerProps = {
      visible,
      isCreate,
      tableRecord,
      fileTypeList,
      fileFormatsList,
      fileUnitList,
      newFileFormat,
      anchor: 'right',
      saving: saveDetailLoading,
      onCancel: this.closeModal,
      onAdd: this.handleAddConfigDetail,
      onEdit: this.handleEditConfigDetail,
      onChangeFileFormats: this.changeFileFormats,
    };
    const listProps = {
      pagination,
      listConfig,
      loading: fetchFileLoading,
      onGetRecordData: this.getRecordData,
      onDelete: this.handleDeleteConfigDetail,
      onChangePage: this.queryNowTenantFileList,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hfile.fileUpload.view.message.title').d('文件上传配置')}>
          {!isTenantRoleLevel() && (
            <Lov
              style={{ width: 200, marginLeft: 8 }}
              value={organizationId}
              textValue={nowTenantId === organizationId ? tenantName : nowTenantName}
              code="HPFM.TENANT"
              onChange={(val, item) => {
                this.changeOrganizationId(val, item);
              }}
              allowClear={false}
            />
          )}
        </Header>
        <Content>
          {this.renderForm()}
          <div className="table-list-search">
            <Button type="primary" icon="plus" onClick={() => this.showModal()}>
              {intl.get('hfile.fileUpload.view.button.add').d('添加详细配置')}
            </Button>
          </div>
          <TableList {...listProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}
