import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty, isNumber, pullAllBy, uniqBy } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
// import { totalRender } from 'utils/renderer';
import intl from 'utils/intl';
import EditorForm from './Form';
import Permissions from './PermissionsLov';
import IconsModal from './Icons';
import styles from './index.less';

const viewMessagePrompt = 'hiam.menuConfig.view.message';
const commonPrompt = 'hzero.common';

export default class Editor extends PureComponent {
  state = {
    dataSource: !isEmpty(this.props.dataSource) ? this.props.dataSource : { type: 'dir' },
    permissionsSelectedRows: [],
    permissionsModalVisible: false,
    permissionsModalDataSource: [],
    permissionsModalPagination: {},
    iconsModalVisible: false,
  };
  // componentDidMount() {
  //   const { resetFields = e => e } = this.editForm;
  //   resetFields();
  // }

  static getDerivedStateFromProps(nextProps, prevState) {
    return nextProps.dataSource.id !== prevState.dataSource.id
      ? { dataSource: nextProps.dataSource }
      : null;
  }

  cancel() {
    const { onCancel = e => e } = this.props;
    const { dataSource = {} } = this.state;
    const { resetFields = e => e } = this.editForm;
    resetFields();
    this.setState({
      dataSource: { ...dataSource, permissions: [] },
      permissionsSelectedRows: [],
    });
    onCancel();
  }

  save() {
    const { handleSave = e => e, onCancel = e => e, dataSource } = this.props;
    const newDataSource = this.state.dataSource;
    const { validateFields = e => e, getFieldsValue } = this.editForm;
    validateFields(['type', 'level', 'parentId', 'name', 'route', 'icon', 'code'], err => {
      if (isEmpty(err)) {
        const values = getFieldsValue();
        handleSave(
          { ...dataSource, ...newDataSource, ...values, virtualFlag: values.virtualFlag ? 1 : 0 },
          onCancel
        );
      }
    });
  }

  create() {
    const { handleCreate = e => e, dataSource } = this.props;
    const newDataSource = this.state.dataSource;
    const { validateFields = e => e, getFieldsValue } = this.editForm;
    validateFields(['type', 'level', 'parentId', 'name', 'route', 'icon', 'code'], err => {
      if (!err) {
        const values = getFieldsValue();
        handleCreate(
          {
            ...dataSource,
            ...values,
            ...newDataSource,
            parentId: isNumber(values.parentId) ? values.parentId : 0,
            code: `${values.codePrefix}.${values.code}`.toLowerCase(),
            virtualFlag: values.virtualFlag ? 1 : 0,
          },
          this.cancel.bind(this)
        );
      }
    });
  }

  addPermissions() {
    const { handleQueryPermissions = e => e } = this.props;
    const { getFieldsValue = e => e } = this.editForm;
    const { level } = getFieldsValue();
    if (!isEmpty(level)) {
      this.setState({
        permissionsModalVisible: true,
      });
      handleQueryPermissions({ level, page: 0, size: 10 }).then(res => {
        if (res) {
          const { dataSource, pagination } = res;
          const { permissionsModalDataSource = [] } = this.state;
          this.setState({
            permissionsModalDataSource: uniqBy(dataSource.concat(permissionsModalDataSource), 'id'),
            permissionsModalPagination: pagination,
          });
        }
      });
    }
  }

  closePermissionsModal() {
    this.setState({
      permissionsModalVisible: false,
      permissionsModalDataSource: [],
      permissionsModalPagination: {},
    });
  }

  onPermissionsModalOk(selectedRows) {
    // const { dispatch } = this.props;
    const { dataSource } = this.state;
    this.setState({
      dataSource: {
        ...dataSource,
        permissions: uniqBy(dataSource.permissions.concat(selectedRows), 'id'),
      },
    });
    this.setState({
      permissionsModalVisible: false,
      permissionsModalDataSource: [],
      permissionsModalPagination: {},
    });
  }

  onPermissionsSelect(record, selected) {
    const { permissionsSelectedRows = [] } = this.state;
    this.setState({
      permissionsSelectedRows: selected
        ? permissionsSelectedRows.concat(record)
        : permissionsSelectedRows.filter(n => n.id !== record.id),
    });
  }

  onPermissionsSelectAll(selected, newSelectedRows, changeRows) {
    const { permissionsSelectedRows = [] } = this.state;
    this.setState({
      permissionsSelectedRows: selected
        ? permissionsSelectedRows.concat(changeRows)
        : pullAllBy([...permissionsSelectedRows], changeRows, 'id'),
    });
  }

  deletePermissions() {
    const { permissionsSelectedRows = [], dataSource } = this.state;
    this.setState({
      dataSource: {
        ...dataSource,
        permissions: pullAllBy([...dataSource.permissions], permissionsSelectedRows, 'id'),
      },
    });
  }

  openIconModal() {
    this.setState({
      iconsModalVisible: true,
    });
  }

  onIconSelect(icon) {
    const { setFieldsValue = e => e } = this.editForm;
    setFieldsValue({ icon });
    this.setState({
      iconsModalVisible: false,
    });
  }

  closeIconsModal() {
    this.setState({
      iconsModalVisible: false,
    });
  }

  handleTypeChange(type) {
    const { setFields = e => e } = this.editForm;
    const { dataSource } = this.state;
    setFields({
      dir: { error: undefined },
      code: { value: undefined, error: undefined },
      name: { value: undefined, error: undefined },
      parentId: { value: undefined, error: undefined },
      route: { value: undefined, error: undefined },
    });
    this.setState({
      dataSource: { ...dataSource, type, permissions: [] },
    });
  }

  setDataSource(newDataSource = {}) {
    const { dataSource } = this.state;
    this.setState({
      dataSource: { ...dataSource, ...newDataSource },
    });
  }

  handlePermissionsTableChange(params) {
    const { handleQueryPermissions = e => e } = this.props;
    const { getFieldsValue = e => e } = this.editForm;
    const { level } = getFieldsValue();
    handleQueryPermissions({ level, page: 0, size: 10, ...params }).then(res => {
      if (res) {
        const { dataSource, pagination } = res;
        this.setState({
          permissionsModalDataSource: dataSource,
          permissionsModalPagination: pagination,
        });
      }
    });
  }

  render() {
    const {
      visible,
      processing = {},
      handleCheckMenuDirExists = e => e,
      levelCode = [],
      handleQueryDir = e => e,
      menuPrefixList = [],
      menuTypeList,
    } = this.props;
    const typePrompt = {
      dir: intl.get(`${viewMessagePrompt}.menu.dir`).d('目录'),
      menu: intl.get(`${viewMessagePrompt}.menu.menu`).d('菜单'),
      root: intl.get(`${viewMessagePrompt}.menu.root`).d('预置目录'),
    };
    const {
      dataSource = {},
      permissionsModalDataSource,
      permissionsModalPagination,
      permissionsModalVisible,
      // permissionsSelectedRows,
      iconsModalVisible,
    } = this.state;
    const title = isNumber(dataSource.id)
      ? intl
          .get(`${viewMessagePrompt}.title.editWithParam`, { name: typePrompt[dataSource.type] })
          .d(`编辑${typePrompt[dataSource.type]}`)
      : intl
          .get(`${viewMessagePrompt}.title.createWithParam`, {
            name: typePrompt[dataSource.type || 'dir'],
          })
          .d(`创建${typePrompt[dataSource.type || 'dir']}`);
    const organizationId = getCurrentOrganizationId();
    // const userInfo = getCurrentUser();
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel.bind(this),
      width: 520,
    };

    const formProps = {
      menuPrefixList,
      menuTypeList,
      ref: ref => {
        this.editForm = ref;
      },
      // codePrefix:
      //   organizationId !== 0
      //     ? `hzero.custom.${!isEmpty(userInfo.tenantNum) ? `${userInfo.tenantNum}.` : ''}`
      //     : 'hzero.standard.',
      organizationId,
      handleCheckMenuDirExists,
      dataSource: { level: 'site', ...dataSource },
      levelCode: levelCode.filter(o => o.value !== 'org'),
      editable: isNumber(dataSource.id),
      dirModalLoading: processing.queryDir,
      handleQueryDir,
      handleTypeChange: this.handleTypeChange.bind(this),
      handleOpenIconModal: this.openIconModal.bind(this),
      handleSetDataSource: this.setDataSource.bind(this),
    };

    // const tableProps = {
    //   dataSource: dataSource.permissions,
    //   pagination: {
    //     showSizeChanger: true,
    //     pageSizeOptions: ['10', '20', '50', '100'],
    //     pageSize: 10,
    //     total: (dataSource.permissions || []).length,
    //     showTotal: totalRender,
    //   },
    //   rowSelection: {
    //     selectedRowKeys: permissionsSelectedRows.map(n => n.id),
    //     onSelect: this.onPermissionsSelect.bind(this),
    //     onSelectAll: this.onPermissionsSelectAll.bind(this),
    //   },
    // };

    const permissionsModalProps = {
      visible: permissionsModalVisible,
      dataSource: permissionsModalDataSource,
      pagination: permissionsModalPagination,
      onCancel: this.closePermissionsModal.bind(this),
      onOk: this.onPermissionsModalOk.bind(this),
      handleFetchData: this.handlePermissionsTableChange.bind(this),
      loading: processing.queryPermissions || false,
      selectedRows: dataSource.permissions,
    };

    const iconsModalProps = {
      visible: iconsModalVisible,
      onSelect: this.onIconSelect.bind(this),
      onCancel: this.closeIconsModal.bind(this),
    };

    return (
      <Drawer {...drawerProps}>
        <div className={styles['hiam-menu-config-editor']}>
          {/* {dataSource.type === 'menu' && (
            <h3>{intl.get(`${viewMessagePrompt}.title.basicInfo`).d('基本信息')}</h3>
          )} */}
          <EditorForm {...formProps} />
          <br />
          {/* {dataSource.type === 'menu' && (
            <Fragment>
              <h3>{intl.get(`${viewMessagePrompt}.title.menuPermission`).d('菜单权限')}</h3>
              <div className="action">
                <Button
                  type="primary"
                  icon="plus"
                  style={{ marginRight: 8 }}
                  onClick={this.addPermissions.bind(this)}
                >
                  {intl.get(`${commonPrompt}.button.create`).d('新建')}
                </Button>
                <Button icon="delete" onClick={this.deletePermissions.bind(this)}>
                  {intl.get(`${commonPrompt}.button.delete`).d('删除')}
                </Button>
              </div>
              <br />
              <Table {...tableProps} />
            </Fragment>
          )} */}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 2,
          }}
        >
          <Button
            onClick={this.cancel.bind(this)}
            disabled={processing.save || processing.create}
            style={{ marginRight: 8 }}
          >
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>
          {isNumber(dataSource.id) ? (
            <Button type="primary" loading={processing.save} onClick={this.save.bind(this)}>
              {intl.get(`${commonPrompt}.button.save`).d('保存')}
            </Button>
          ) : (
            <Button type="primary" loading={processing.create} onClick={this.create.bind(this)}>
              {intl.get(`${commonPrompt}.button.ok`).d('确定')}
            </Button>
          )}
        </div>
        <Permissions {...permissionsModalProps} />
        <IconsModal {...iconsModalProps} />
      </Drawer>
    );
  }
}
