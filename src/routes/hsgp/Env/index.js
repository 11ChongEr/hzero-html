/*
 * 环境管理-列表页面
 * @date: 2018/10/7
 * @author: 周邓 <deng.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Table, Form, Input, Popconfirm } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { createPagination, tableScrollWidth } from 'utils/utils';
import notification from 'utils/notification';
import { statusRender } from 'utils/renderer';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import ReleaseDrawer from './Drawer/ReleaseDrawer';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@connect(({ loading, env }) => ({
  fecthData: loading.effects['env/fetchEnv'],
  env,
}))
@formatterCollections({ code: 'hsgp.env' })
@cacheComponent({ cacheKey: '/hsgp/env/list' })
export default class Env extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      isEdit: false,
      pagination: {},
    };
  }

  componentDidMount() {
    this.fetchEnv();
  }

  /**
   * @function fetchEnv - 获取环境数据
   * @param {object} params -环境查询参数
   */
  fetchEnv(params = {}) {
    const { dispatch, form } = this.props;
    return dispatch({
      type: 'env/fetchEnv',
      payload: { ...form.getFieldsValue(), page: 0, size: 10, ...params },
    }).then(res => {
      if (res) {
        this.setState({
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * @function createNew - 新建环境
   */
  @Bind()
  createNew() {
    const { dispatch } = this.props;
    // 获取授权类型
    dispatch({
      type: 'env/fetchGrantType',
    });
    this.setState({
      modalVisible: true,
    });
  }

  /**
   * 取消 Modal
   * @function handleCancle
   */
  @Bind()
  handleCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'env/updateState',
      payload: {
        basicList: {},
        configList: {},
        envId: null,
        URIParams: [],
        requestParams: [],
      },
    });
    this.setState({
      modalVisible: false,
      isEdit: false,
    });
  }

  /**
   * @function handleUpdateEnv - 编辑环境
   * @param {object} record -环境查询参数
   * @param {string} record.envCode -环境编码
   * @param {string} record.envName -环境名称
   * @param {string} record.description -描述
   * @param {number} record.orderSeq -序号
   * @param {string} record.devopsEnvName -DevOps环境
   * @param {number} record.activeFlag -环境状态
   * @param {number} record.connectFlag -连接状态
   */
  @Bind()
  handleUpdateEnv(record) {
    const { envId } = record;
    const { dispatch } = this.props;
    this.setState({
      modalVisible: true,
      isEdit: true,
    });
    // 保存当前环境id
    dispatch({
      type: 'env/updateState',
      payload: {
        envId,
      },
    });
    // 获取授权类型
    dispatch({
      type: 'env/fetchGrantType',
    });
    // 获取当前环境信息
    this.fetchEnvInfo(envId);
  }

  /**
   * @function fetchEnvInfo - 获取环境信息
   * @param {object} params -环境查询参数
   *  @param {number} param.envId -环境id
   */
  fetchEnvInfo(envId) {
    const { dispatch } = this.props;
    // 获取基本信息
    dispatch({
      type: 'env/fetchEnvBasicInfo',
      payload: {
        envId,
      },
    });
    // 获取配置信息
    dispatch({
      type: 'env/fetchEnvConfigInfo',
      payload: {
        envId,
      },
    });
  }

  /**
   * @function saveEvn - 保存当前环境数据
   */
  @Bind()
  saveEvn() {
    const { dispatch } = this.props;
    this.fetchEnv();
    this.setState({
      modalVisible: false,
      isEdit: false,
    });
    dispatch({
      type: 'env/updateState',
      payload: {
        envId: null,
      },
    });
  }

  /**
   * @function handleSearch - 搜索表单
   */
  @Bind()
  handleSerach() {
    this.fetchEnv();
  }

  /**
   * @function resetSerach - 重置搜索表单
   */
  @Bind()
  resetSerach() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * @function handleStandardTableChange - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchEnv({
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  }

  /**
   * @function handleDeleteEnv - 删除操作
   * @param {object} record -环境数据
   * @param {number} params.envId -环境id
   * @param {string} record.envCode -环境编码
   * @param {string} record.envName -环境名称
   * @param {string} record.description -描述
   * @param {number} record.orderSeq -序号
   * @param {string} record.devopsEnvName -DevOps环境
   * @param {number} record.activeFlag -环境状态
   * @param {number} record.connectFlag -连接状态
   */
  handleDeleteEnv(record) {
    const { dispatch } = this.props;
    const { pagination } = this.state;
    dispatch({
      type: 'env/deleteEnv',
      payload: {
        ...record,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchEnv({
          page: pagination.current - 1,
          size: pagination.pageSize,
        });
      }
    });
  }

  /**
   * @function renderSerachForm - 渲染搜索表单
   */
  renderSerachForm() {
    const { getFieldDecorator } = this.props.form;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline">
        <FormItem {...formLayout} label={intl.get('hsgp.env.model.env.envCode').d('环境编码')}>
          {getFieldDecorator('envCode')(<Input trim typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem {...formLayout} label={intl.get('hsgp.env.model.env.envName').d('环境名称')}>
          {getFieldDecorator('envName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSerach}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button onClick={this.resetSerach}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const { pagination, modalVisible, isEdit, envId } = this.state;
    const {
      env: { envList = {} },
      fecthData,
    } = this.props;
    const DrawerProps = {
      modalVisible,
      isEdit,
      envId,
      onCancel: this.handleCancel,
      saveEvn: this.saveEvn,
    };

    const columns = [
      {
        title: intl.get('hsgp.env.model.env.envCode').d('环境编码'),
        dataIndex: 'envCode',
      },
      {
        title: intl.get('hsgp.env.model.env.envName').d('环境名称'),
        dataIndex: 'envName',
      },
      {
        title: intl.get('hsgp.env.model.env.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.env.model.env.orderSeq').d('序号'),
        dataIndex: 'orderSeq',
        width: 100,
      },
      {
        title: intl.get('hsgp.env.model.env.devopsEnvName').d('DevOps环境'),
        dataIndex: 'devopsEnvName',
      },
      {
        title: intl.get('hsgp.env.model.env.activeFlag').d('环境状态'),
        dataIndex: 'activeFlag',
        width: 100,
        render: text => {
          return statusRender(
            `${text ? 'S' : 'F'}`,
            `${
              text
                ? intl.get('hsgp.env.model.env.operating').d('运行中')
                : intl.get('hsgp.env.model.env.stopped').d('已停用')
            }`
          );
        },
      },
      {
        title: intl.get('hsgp.env.model.env.connectFlag').d('连接状态'),
        dataIndex: 'connectFlag',
        width: 100,
        render: text => {
          return statusRender(
            `${text ? 'S' : 'F'}`,
            `${
              text
                ? intl.get('hsgp.env.model.env.connected').d('已连接')
                : intl.get('hsgp.env.model.env.disConnected').d('未连接')
            }`
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 110,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleUpdateEnv(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => {
                  this.handleDeleteEnv(record);
                }}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.env.view.message.envManage').d('应用环境管理')}>
          <Button icon="plus" type="primary" onClick={this.createNew}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderSerachForm()}</div>
          <Table
            bordered
            rowKey="envId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            dataSource={envList.content || []}
            loading={fecthData}
            onChange={this.handleStandardTableChange}
          />
        </Content>
        <ReleaseDrawer {...DrawerProps} />
      </React.Fragment>
    );
  }
}
