import React, { PureComponent } from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import styles from './index.less';

/**
 * 部门维护-数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} addLine - 新增部门
 * @reactProps {Function} clearLine - 清除新增部门
 * @reactProps {Function} forbidLine - 禁用部门
 * @reactProps {Function} enabledLine - 启用部门
 * @reactProps {Function} showSubLine - 下级部门展示
 * @reactProps {Function} gotoSubGrade - 部门分配岗位
 * @reactProps {Function} activeLine - 编辑框激活
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Array} expandedRowKeys - 展开行标识
 * @return React.element
 */
export default class DataTable extends PureComponent {
  /**
   * 点击'+',获取当前节点的下级节点
   * @param {Boolean} isExpand 展开标记
   * @param {Object} record  当前行
   */
  @Bind()
  handleExpandRow(isExpand, record) {
    this.props.onShowSubLine(isExpand, record);
  }

  /**
   * 分配岗位
   * @param {Object} record 操作对象
   */
  @Bind()
  gotoSubGrade(record) {
    this.props.gotoSubGrade(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dataSource,
      loading,
      expandedRowKeys,
      onClearLine,
      onAddLine,
      onEnabledLine,
      onForbidLine,
      onEdit,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.department.code').d('部门编码'),
        dataIndex: 'unitCode',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.department.code').d('部门编码'),
                    }),
                  },
                ],
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('entity.department.name').d('部门名称'),
        dataIndex: 'unitName',
        width: 300,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('entity.department.name').d('部门名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get('entity.department.name').d('部门名称')}
                  field="unitName"
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hpfm.common.model.common.orderSeq').d('排序号'),
        dataIndex: 'orderSeq',
        width: 150,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item>
              {record.$form.getFieldDecorator('orderSeq', {
                initialValue: 1,
              })(<InputNumber min={1} precision={0} />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 300,
        align: 'center',
        render: (val, record) =>
          record._status === 'create' ? (
            <a onClick={() => onClearLine(record)}>
              {intl.get('hzero.common.button.clean').d('清除')}
            </a>
          ) : record.enabledFlag ? (
            <span className="action-link">
              <a onClick={() => onEdit(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
              <a onClick={() => onAddLine(record)}>{intl.get('hzero').d('新增下级')}</a>
              <a onClick={() => onForbidLine(record)}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
              <a onClick={() => this.gotoSubGrade(record)}>
                {intl.get('hpfm.department.view.option.assign').d('分配岗位')}
              </a>
            </span>
          ) : (
            <span className="action-link">
              <a onClick={() => onEdit(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
              <a style={{ color: '#F04134' }}>
                {intl.get('hzero.common.status.disable').d('禁用')}
              </a>
              <a onClick={() => onEnabledLine(record)}>
                {intl.get('hzero.common.status.enable').d('启用')}
              </a>
              <a onClick={() => this.gotoSubGrade(record)}>
                {intl.get('hpfm.department.view.option.assign').d('分配岗位')}
              </a>
            </span>
          ),
      },
    ];
    return (
      <EditTable
        bordered
        rowKey="unitId"
        className={styles['hpfm-hr-show']}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        onExpand={this.handleExpandRow}
        expandedRowKeys={expandedRowKeys}
        indentSize={24}
        pagination={false}
      />
    );
  }
}
