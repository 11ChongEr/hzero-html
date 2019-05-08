import React from 'react';
import { Button, Modal, Tree, Form, Select, Spin } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { queryColumn, downloadFile, queryIdpValue } from '../../services/api';

// 监听导出错误时 postMessage 事件
window.addEventListener('message', e => {
  const {
    data: { type, message },
  } = e;
  if (type && type === 'downloadError') {
    notification.warning({ message });
  }
});

/**
 * 使用Tree的TreeNode组件
 */
const { TreeNode } = Tree;

/**
 * 导出Excel ExcelExport
 *
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {!string} [requestUrl=''] - 导出请求的url
 * @reactProps {?string} [method='GET'] - 导出请求的类型，默认GET请求
 * @reactProps {!object} [queryParams={}] - 表单查询参数，查询之后将会导出查询的数据
 * @reactProps {?object} [queryFormItem = {}] - 导出条件
 * @reactProps {?object} [otherButtonProps = {}] - 导出按钮props
 * @returns React.element
 * @example
 * import ExcelExport from 'components/ExcelExport';
 *
 *   queryFormItem() {
 *    return (
 *      <React.Fragment>
 *        <FormItem label='事件编码'>
 *          {this.props.form.getFieldDecorator('eventCode', {
 *            initialValue: '',
 *          })(<Input style={{ width: '150px' }} />)}
 *        </FormItem>
 *        <FormItem label='事件描述'>
 *          {this.props.form.getFieldDecorator('eventDescription', {
 *            initialValue: '',
 *          })(<Input style={{ width: '150px' }} />)}
 *        </FormItem>
 *      </React.Fragment>
 *    );
 *   }
 *
 * <ExcelExport
 *  requestUrl={`${HZERO_PLATFORM} /v1/events/export`}
 *  queryParams={this.props.form.getFieldsValue()}
 *  queryFormItem={this.queryFormItem()}
 * />
 */
@Form.create({ fieldNameProp: null })
export default class ExcelExport extends React.PureComponent {
  // 选择的列
  selectRecord = [];

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      exportList: [],
      exportPending: false,
      fetchColumnLoading: true,
      // 树
      expandedKeys: [], // 展开的节点
      checkedKeys: [], // 选择的节点
      exportTypeList: [], // 导出类型值集
      fillerType: 'single-sheet', // 选择的导出类型
    };
  }

  /**
   * @function queryColumnData - 查询可以选择导出的列数据
   */
  @Bind()
  queryColumnData() {
    const { requestUrl, method = 'GET' } = this.props;
    queryColumn({ requestUrl, method })
      .then(res => {
        const response = getResponse(res);
        if (response && response.children) {
          this.setState({
            exportList: [res],
            expandedKeys: [`${res.id}`],
          });
        }
      })
      .finally(() => {
        this.setState({ fetchColumnLoading: false });
      });
  }

  /**
   * @function showModal - 控制对话框是否可见
   * @param {boolean} flag - 对话框显示标识
   */
  showModal(flag) {
    this.setState({
      modalVisible: flag,
    });
    if (flag) {
      queryIdpValue('HPFM.EXCEL_EXPORT_TYPE').then(res => {
        const response = getResponse(res);
        if (response) {
          this.setState({
            exportTypeList: res,
          });
        }
      });
      this.queryColumnData();
    } else {
      this.selectRecord = [];
      this.setState({ checkedKeys: [] });
    }
  }

  /**
   * @function handleExpand - 节点展开
   * @param {array} expandedKeys - 展开的节点组成的数组
   */
  @Bind()
  handleExpand(expandedKeys) {
    this.setState({
      expandedKeys,
    });
  }

  /**
   * @function handleSelect - 选择项变化监控
   * @param {array}} checkedKeys - 选中项的 key 数组
   */
  @Bind()
  handleSelect(checkedKeys) {
    this.setState({ checkedKeys });
    this.selectRecord = checkedKeys;
  }

  /**
   * @function handleExport - 导出，下载文件
   */
  @Bind()
  @Debounce(500)
  handleExport() {
    const { requestUrl = '', queryParams = {}, form, method = 'GET' } = this.props;
    const { fillerType } = this.state;
    const newQueryParams = { ...queryParams, ...form.getFieldsValue() };
    if (
      !this.selectRecord ||
      (Array.isArray(this.selectRecord) && this.selectRecord.length === 0)
    ) {
      Modal.warning({
        title: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
    } else {
      this.setState({ exportPending: true });
      const params = this.selectRecord.map(item => {
        return { name: 'ids', value: item };
      });
      // 添加表单查询参数
      if (queryParams) {
        for (const key of Object.keys(newQueryParams)) {
          if (newQueryParams[key]) {
            params.push({ name: key, value: newQueryParams[key] });
          }
        }
      }
      // 添加导出Excel参数
      params.push({ name: 'exportType', value: 'DATA' });
      params.push({ name: 'fillerType', value: fillerType });
      downloadFile({ requestUrl, queryParams: params, method }).then(res => {
        if (res) {
          this.setState({ exportPending: false });
        }
      });
    }
  }

  /**
   * @function renderTreeNodes - 渲染树的子节点
   * @param {object} data - 列数据
   */
  @Bind()
  renderTreeNodes(data) {
    return data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} key={item.id} />;
    });
  }

  /**
   * @function handleExportType - 选择导出类型
   */
  @Bind()
  handleExportType(value) {
    this.setState({
      fillerType: value,
    });
  }

  renderQueryForm() {
    const { queryFormItem } = this.props;
    return <Form layout="inline">{queryFormItem}</Form>;
  }

  render() {
    const {
      buttonText = intl.get('hzero.common.button.export').d('导出'),
      title = intl.get(`hzero.common.components.export`).d('导出Excel'),
      queryFormItem,
      otherButtonProps,
    } = this.props;
    const { exportTypeList, exportList, fetchColumnLoading } = this.state;
    const modalProps = {
      title,
      bodyStyle: { height: '460px', overflowY: 'scroll' },
      visible: this.state.modalVisible,
      onCancel: this.showModal.bind(this, false),
      onOk: () => this.handleExport(),
      confirmLoading: this.state.exportPending,
    };
    const buttonProps = {
      icon: 'export',
      type: 'default',
      onClick: this.showModal.bind(this, true),
      ...otherButtonProps,
    };
    return (
      <React.Fragment>
        <Button {...buttonProps}>{buttonText}</Button>
        <Modal {...modalProps}>
          <Spin spinning={fetchColumnLoading}>
            <React.Fragment>
              <span>导出类型：</span>
              <Select
                style={{ width: '150px' }}
                defaultValue="single-sheet"
                onChange={this.handleExportType}
              >
                {exportTypeList.map(item => {
                  return (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  );
                })}
              </Select>
            </React.Fragment>
            {queryFormItem && (
              <React.Fragment>
                <div style={{ margin: '12px auto' }}>
                  {intl.get(`hzero.common.components.export.condition`).d('设置导出条件')}
                </div>
                {this.renderQueryForm()}
              </React.Fragment>
            )}
            <div style={{ margin: '12px auto' }}>
              {intl.get(`hzero.common.components.export.columns`).d('选择要导出的列')}
            </div>
            <Tree
              checkable
              onExpand={this.handleExpand}
              expandedKeys={this.state.expandedKeys}
              defaultExpandedKeys={this.state.expandedKeys}
              onCheck={this.handleSelect}
              checkedKeys={this.state.checkedKeys}
            >
              {this.renderTreeNodes(exportList)}
            </Tree>
          </Spin>
        </Modal>
      </React.Fragment>
    );
  }
}
