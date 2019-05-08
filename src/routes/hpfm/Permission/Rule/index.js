import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import QueryForm from './Form';
import List from './List';
import Editor from './Editor';
import styles from './index.less';

@connect(({ loading, permission }) => ({
  loading,
  permission,
}))
@formatterCollections({ code: 'hpfm.permission' })
export default class Role extends PureComponent {
  static propTypes = {
    dispatch: PropTypes.func,
    permission: PropTypes.object.isRequired,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  constructor(props) {
    super(props);
    this.fetchList = this.fetchList.bind(this);
    this.openEditor = this.openEditor.bind(this);
  }

  componentDidMount() {
    this.fetchList();
    this.fetchPermissionRuleTypeCode();
  }

  state = {
    visible: false,
    editorDataSource: {},
  };

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  fetchList(payload) {
    const { dispatch } = this.props;
    dispatch({ type: 'permission/queryRuleList', payload });
  }

  /**
   * fetchPermissionRuleTypeCode - 查询规则类型值集
   */
  fetchPermissionRuleTypeCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'permission/queryCode',
      payload: { lovCode: 'HPFM.PERMISSION_RULE_TYPE' },
    });
  }

  openEditor(editorDataSource = {}) {
    this.setState(
      {
        visible: true,
      },
      () => {
        if (!isEmpty(editorDataSource)) {
          this.setState({
            editorDataSource,
          });
        }
      }
    );
  }

  closeEditor() {
    this.setState({
      visible: false,
      editorDataSource: {},
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
      permission: { rule = {} },
    } = this.props;
    dispatch({ type: 'permission/deleteRule', payload: { ...record } }).then(res => {
      if (res) {
        const { getFieldsValue = e => e } = this.queryForm;
        const { list = {} } = rule;
        const { current = 1, pageSize = 10 } = list.pagination;
        this.fetchList({ ...getFieldsValue(), page: current - 1, size: pageSize });
        notification.success();
      }
    });
  }

  handleCreate(data, success = e => e) {
    const {
      dispatch = e => e,
      permission: { rule = {} },
    } = this.props;
    return dispatch({ type: 'permission/createRule', data }).then(res => {
      if (res) {
        const { getFieldsValue = e => e } = this.queryForm;
        const { list = {} } = rule;
        const { current = 1, pageSize = 10 } = list.pagination;
        this.fetchList({ ...getFieldsValue(), page: current - 1, size: pageSize });
        success();
      }
      return res;
    });
  }

  handleUpdate(data, success = e => e) {
    const {
      dispatch = e => e,
      permission: { rule = {} },
    } = this.props;
    return dispatch({ type: 'permission/updateRule', data }).then(res => {
      if (res) {
        const { getFieldsValue = e => e } = this.queryForm;
        const { list = {} } = rule;
        const { current = 1, pageSize = 10 } = list.pagination;
        this.fetchList({ ...getFieldsValue(), page: current - 1, size: pageSize });
        success();
      }
      return res;
    });
  }

  render() {
    const { permission = {}, loading = {} } = this.props;
    const { visible, editorDataSource } = this.state;
    const { rule } = permission;
    const { effects } = loading;
    const organizationId = getCurrentOrganizationId();
    const commonPrompt = {
      ruleCode: '',
      ruleName: '',
      sqlValue: '',
      enabledFlag: '',
      description: '',
    };
    const formProps = {
      ref: node => {
        this.queryForm = node;
      },
      handleQueryList: this.fetchList,
      organizationId,
      prompt: {
        ...commonPrompt,
        search: '',
        reset: '',
      },
    };
    const listProps = {
      loading: effects['permission/queryRuleList'],
      ...rule.list,
      onChange: this.onTableChange.bind(this),
      openEditor: this.openEditor.bind(this),
      prompt: {
        ...commonPrompt,
        option: '',
      },
      handleDelete: this.delete.bind(this),
    };
    const editorProps = {
      visible,
      dataSource: editorDataSource,
      onCancel: this.closeEditor.bind(this),
      permissionRuleType: permission.code['HPFM.PERMISSION_RULE_TYPE'] || [],
      organizationId,
      prompt: {
        ...commonPrompt,
        creationTitle: '',
        editorTitle: '',
        cancel: '',
        save: '',
        create: '',
      },
      handleUpdate: this.handleUpdate.bind(this),
      handleCreate: this.handleCreate.bind(this),
      processing: effects['permission/updateRule'] || effects['permission/createRule'],
    };
    return (
      <div className={styles['hpfm-permission-rule']}>
        <QueryForm {...formProps} />
        <br />
        <div className="action">
          <Button
            icon="plus"
            type="primary"
            style={{ marginRight: 16 }}
            onClick={() => this.openEditor()}
          >
            {intl.get('hpfm.permission.view.option.create').d('创建屏蔽规则')}
          </Button>
        </div>
        <br />
        <List {...listProps} />
        <Editor {...editorProps} />
      </div>
    );
  }
}
