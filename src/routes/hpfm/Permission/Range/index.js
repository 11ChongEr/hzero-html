import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { isNumber } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';

import QueryForm from './Form';
import Editor from './Editor';
import List from './List';
import styles from './index.less';

@connect(({ loading, permission }) => ({
  loading,
  permission,
}))
@formatterCollections({ code: 'hpfm.permission' })
export default class Range extends PureComponent {
  constructor(props) {
    super(props);
    this.fetchList = this.fetchList.bind(this);
    this.fetchPermissionRel = this.fetchPermissionRel.bind(this);
    this.openEditor = this.openEditor.bind(this);
  }

  state = {
    visible: false,
    editorDataSource: {},
    editorPermissionRelDataSource: [],
  };

  componentDidMount() {
    this.fetchList();
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  fetchList(payload) {
    const { dispatch } = this.props;
    dispatch({ type: 'permission/queryRangeList', payload });
  }

  fetchPermissionRel(rangeId) {
    const { dispatch } = this.props;
    dispatch({ type: 'permission/queryPermissionRel', rangeId }).then(res => {
      if (res) {
        this.setState({
          editorPermissionRelDataSource: res,
        });
      }
    });
  }

  deletePermissionRel(record) {
    const { dispatch } = this.props;
    const { editorDataSource } = this.state;
    dispatch({ type: 'permission/deletePermissionRel', payload: { ...record } }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        notification.success();
        this.fetchPermissionRel(editorDataSource.rangeId);
      }
    });
  }

  addPermissionRel(data) {
    const { dispatch } = this.props;
    const { editorDataSource } = this.state;
    dispatch({ type: 'permission/addPermissionRel', data }).then(res => {
      if (res) {
        this.fetchPermissionRel(editorDataSource.rangeId);
        notification.success();
      }
    });
  }

  openEditor(editorDataSource = {}) {
    this.setState(
      {
        visible: true,
        editorDataSource,
      },
      () => {
        if (isNumber(editorDataSource.rangeId)) {
          this.fetchPermissionRel(editorDataSource.rangeId);
        }
      }
    );
  }

  closeEditor() {
    this.setState({
      visible: false,
      editorDataSource: {},
      editorPermissionRelDataSource: [],
    });
  }

  onTableChange(pagination) {
    const { getFieldsValue = e => e } = this.queryForm;
    const { current, pageSize } = pagination;
    this.fetchList({ page: current === 0 ? 0 : current - 1, size: pageSize, ...getFieldsValue() });
  }

  delete(record) {
    const {
      dispatch = e => e,
      permission: { range = {} },
    } = this.props;
    dispatch({ type: 'permission/deleteRange', payload: record }).then(res => {
      if (res) {
        const { getFieldsValue = e => e } = this.queryForm;
        const { list = {} } = range;
        const { current = 1, pageSize = 10 } = list.pagination;
        this.fetchList({ ...getFieldsValue(), page: current - 1, size: pageSize });
        notification.success();
      }
    });
  }

  handleCreate(data, success = e => e) {
    const {
      dispatch = e => e,
      permission: { range = {} },
    } = this.props;
    return dispatch({ type: 'permission/createRange', data }).then(res => {
      if (res) {
        const { getFieldsValue = e => e } = this.queryForm;
        const { list = {} } = range;
        const { current = 1, pageSize = 10 } = list.pagination;
        this.fetchList({ ...getFieldsValue(), page: current - 1, size: pageSize });
        success(res);
      }
      return res;
    });
  }

  handleUpdate(data, success = e => e) {
    const {
      dispatch = e => e,
      permission: { range = {} },
    } = this.props;
    return dispatch({ type: 'permission/updateRange', data }).then(res => {
      if (res) {
        const { getFieldsValue = e => e } = this.queryForm;
        const { list = {} } = range;
        const { current = 1, pageSize = 10 } = list.pagination;
        this.fetchList({ ...getFieldsValue(), page: current - 1, size: pageSize });
        success();
      }
      return res;
    });
  }

  handleSetEditorDataSource(newDaSource = {}) {
    const { editorDataSource } = this.state;
    this.setState({
      editorDataSource: { ...editorDataSource, ...newDaSource },
    });
  }

  render() {
    const { permission = {}, loading = {} } = this.props;
    const { visible, editorDataSource, editorPermissionRelDataSource } = this.state;
    const { range } = permission;
    const { effects } = loading;
    const organizationId = getCurrentOrganizationId();
    const formProps = {
      ref: node => {
        this.queryForm = node;
      },
      handleQueryList: this.fetchList,
      organizationId,
    };
    const listProps = {
      loading: effects['permission/queryRangeList'],
      ...range.list,
      onChange: this.onTableChange.bind(this),
      openEditor: this.openEditor.bind(this),
      handleDelete: this.delete.bind(this),
    };
    const editorProps = {
      visible,
      organizationId,
      dataSource: editorDataSource,
      permissionRelDataSource: editorPermissionRelDataSource,
      onCancel: this.closeEditor.bind(this),
      handleUpdate: this.handleUpdate.bind(this),
      handleCreate: this.handleCreate.bind(this),
      processing: {
        save: effects['permission/updateRange'] || effects['permission/createRange'],
        queryPermissionRel:
          effects['permission/queryPermissionRel'] || effects['permission/addPermissionRel'],
        deletePermissionRel: effects['permission/deletePermissionRel'],
      },
      handleAddPermissionRel: this.addPermissionRel.bind(this),
      handlefetchPermissionRel: this.fetchPermissionRel.bind(this),
      handleDeletePermissionRel: this.deletePermissionRel.bind(this),
      handleSetEditorDataSource: this.handleSetEditorDataSource.bind(this),
    };
    return (
      <div className={styles['hpfm-permission-range']}>
        <QueryForm {...formProps} />
        <br />
        <div className="action">
          <Button
            icon="plus"
            type="primary"
            style={{ marginRight: 16 }}
            onClick={() => this.openEditor()}
          >
            {intl.get('hpfm.permission.view.option.createRange').d('创建范围')}
          </Button>
        </div>
        <br />
        <List {...listProps} />
        <Editor {...editorProps} />
      </div>
    );
  }
}
