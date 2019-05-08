/**
 * index.js - 单据权限定义
 * @date: 2018-10-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Button, Table } from 'hzero-ui';

import { Header, Content } from 'components/Page';

import { enableRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { isTenantRoleLevel, tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import EditForm from './EditForm';
import AuthForm from './AuthForm';

@connect(({ docType, loading }) => ({
  docType,
  loading: loading.effects['docType/queryDocType'],
  editLoading: loading.effects['docType/queryDocTypeDetail'],
  authLoading: loading.effects['docType/queyDocTypeAuth'],
  saveDocLoading: loading.effects['docType/saveDocType'],
  saveAuthLoading: loading.effects['docType/updateDocTypeAuth'],
}))
@formatterCollections({
  code: 'hiam.docType',
})
export default class DocType extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 查询表单子组件对象
    this.editForm = {}; // 单据类型定义编辑表单对象
    this.authForm = {}; // 单据权限维度表单对象
    this.state = {
      selectedRowKeys: [], // 选中的单据类型列表
      editFormVisible: false, // 单据类型定义编辑表单显示
      authFormVisible: false, // 单据类型权限维度表单显示
      currentDocTypeId: undefined, // 当前编辑行的单据 ID
      isNewDocType: false, // 新建的状态
    };
  }

  componentDidMount() {
    const {
      dispatch,
      docType: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'docType/queryLevelCode',
    });
    this.handleSearch(pagination);
  }

  /**
   * 查询单据类型定义
   * @param {Object} pagination - 分页查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const params = this.filterForm.props.form.getFieldsValue();

    dispatch({
      type: 'docType/queryDocType',
      payload: {
        page,
        ...params,
      },
    });
  }

  /**
   *
   * @param {object} ref - filterForm 子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  /**
   * 生成数据屏蔽规则
   */
  @Bind()
  handleCreateRule() {
    const { selectedRowKeys } = this.state;
    const {
      dispatch,
      docType: { pagination = {} },
    } = this.props;
    if (!isEmpty(selectedRowKeys)) {
      dispatch({
        type: 'docType/createDataRules',
        payload: selectedRowKeys,
      }).then(response => {
        if (response) {
          this.setState({
            selectedRowKeys: [],
          });
          this.handleSearch(pagination);
          notification.success();
        }
      });
    }
  }

  /**
   * 显示单据权限编辑侧栏
   * @param {Object} record - 单据权限行数据
   */
  @Bind()
  showEditForm(record) {
    const { dispatch } = this.props;
    const { docTypeId } = record;
    this.setState(
      {
        currentDocTypeId: docTypeId,
      },
      () => {
        this.showForm('edit');
        dispatch({
          type: 'docType/queryDocTypeDetail',
          payload: {
            docTypeId,
          },
        });
      }
    );
  }

  /**
   * 保存单据权限编辑数据
   * @param {Object} record - 单据权限行数据
   */
  @Bind()
  handleEditSave(record) {
    const {
      dispatch,
      docType: { pagination = {} },
    } = this.props;
    const { docTypeId } = record;
    dispatch({
      type: 'docType/saveDocType',
      payload: {
        docTypeId,
        body: record,
      },
    }).then(res => {
      if (res) {
        this.hideModal('edit');
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 显示单据权限权限分配侧栏
   * @param {Object} record - 单据权限权限分配数据
   */
  @Bind()
  showAuthForm(record) {
    const { dispatch } = this.props;
    const { docTypeId } = record;

    this.setState(
      {
        currentDocTypeId: docTypeId,
      },
      () => {
        this.showForm('auth');
        dispatch({
          type: 'docType/queyDocTypeAuth',
          payload: {
            docTypeId,
          },
        });
      }
    );
  }

  /**
   * 单据权限权限编辑保存
   * @param {Object} record - 单据权限权限编辑数据
   */
  @Bind()
  handleAuthSave(record) {
    const { dispatch } = this.props;
    const { currentDocTypeId: docTypeId } = this.state;
    dispatch({
      type: 'docType/updateDocTypeAuth',
      payload: {
        docTypeId,
        body: record,
      },
    }).then(() => {
      this.hideModal('auth');
      notification.success();
    });
  }

  /**
   * 显示新建或编辑单据权限侧栏
   * @param {String} type - 展示类型
   */
  @Bind()
  showForm(type) {
    this.handleFormVisible(true, type);
  }

  /**
   * 关闭新建或编辑单据权限侧栏
   * @param {String} type - 侧栏类型
   */
  @Bind()
  hideModal(type) {
    const { saving = false, dispatch } = this.props;
    if (type === 'edit') {
      this.setState({
        isNewDocType: false,
      });
    }
    if (!saving) {
      this.handleFormVisible(false, type);
    }
    this[`${type}Form`].resetState();
    this[`${type}Form`].props.form.resetFields();
    dispatch({
      type: 'docType/updateState',
      payload: {
        docTypeDetail: {},
        docTypeAuth: [],
      },
    });
  }

  /**
   * 单据权限表单显示控制
   * @param {Boolean} flag - 是否显示
   * @param {String} type - 单据权限编辑类型
   */
  handleFormVisible(flag, type) {
    if (flag === false && this[type] && type === 'edit') {
      this[type].resetForm();
    }
    this.setState({
      [`${type}FormVisible`]: !!flag,
    });
  }

  /**
   * 创建单据权限
   */
  @Bind()
  handleCreateDocType() {
    this.setState(
      {
        isNewDocType: true,
      },
      () => {
        this.showForm('edit');
      }
    );
  }

  render() {
    const { currentDocTypeId, selectedRowKeys, isNewDocType } = this.state;
    const {
      loading,
      editLoading,
      authLoading,
      saveDocLoading,
      saveAuthLoading,
      docType: {
        docTypeList = {},
        docTypeDetail = {},
        roleAuthScopeTypeCode = [],
        docTypeAuth = [],
        docTypeLevelCode = [],
        pagination = {},
      },
    } = this.props;

    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };

    const columns = [
      {
        title: intl.get('hiam.docType.model.docType.docTypeCode').d('类型编码'),
        dataIndex: 'docTypeCode',
      },
      {
        title: intl.get('hiam.docType.model.docType.docTypeName').d('类型名称'),
        dataIndex: 'docTypeName',
        width: 250,
      },
      {
        title: intl.get('hiam.docType.model.docType.levelCode').d('层级'),
        dataIndex: 'levelCode',
        width: 100,
        render: value =>
          docTypeLevelCode.find(m => m.value === value) &&
          docTypeLevelCode.find(m => m.value === value).meaning,
      },
      {
        title: intl.get('hiam.docType.model.docType.orderSeq').d('排序号'),
        dataIndex: 'orderSeq',
        width: 100,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        width: 150,
        render: (_, record) => {
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  this.showEditForm(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a
                onClick={() => {
                  this.showAuthForm(record);
                }}
              >
                {intl.get('hiam.docType.view.button.editAuth').d('维护权限维度')}
              </a>
            </span>
          );
        },
      },
    ].filter(col => {
      return isTenantRoleLevel() ? col.dataIndex !== 'levelCode' : true;
    });

    const rowSelection = {
      selectedRowKeys,
      onChange: keys => {
        this.setState({
          selectedRowKeys: keys,
        });
      },
    };

    return (
      <React.Fragment>
        <Header title={intl.get('hiam.docType.view.title.docType').d('单据权限类型定义')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateDocType}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="plus" onClick={this.handleCreateRule}>
            {intl.get('hiam.docType.view.button.createRule').d('生成数据屏蔽规则')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            rowKey="docTypeId"
            bordered
            loading={loading}
            dataSource={docTypeList.content}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handleSearch}
            pagination={pagination}
            rowSelection={rowSelection}
          />
        </Content>
        {/* 编辑单据类型详情表单 */}
        <EditForm
          sideBar
          destroyOnClose
          title={intl.get('hiam.docType.view.title.editFormTitle').d('单据类型定义')}
          width={580}
          onRef={ref => {
            this.editForm = ref;
          }}
          confirmLoading={saveDocLoading}
          handleSave={this.handleEditSave}
          loading={isNewDocType ? false : editLoading}
          data={docTypeDetail}
          docTypeId={currentDocTypeId}
          docTypeLevelCode={docTypeLevelCode}
          modalVisible={this.state.editFormVisible}
          hideModal={() => this.hideModal('edit')}
        />
        {/* 编辑单据类型权限维度表单 */}
        <AuthForm
          sideBar
          destroyOnClose
          title={intl.get('hiam.docType.view.title.authFormTitle').d('采购订单权限维度')}
          width={1200}
          onRef={ref => {
            this.authForm = ref;
          }}
          confirmLoading={saveAuthLoading}
          handleSave={this.handleAuthSave}
          loading={authLoading}
          data={docTypeAuth}
          docTypeId={currentDocTypeId}
          roleAuthScopeTypeCode={roleAuthScopeTypeCode}
          modalVisible={this.state.authFormVisible}
          hideModal={() => this.hideModal('auth')}
        />
      </React.Fragment>
    );
  }
}
