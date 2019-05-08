/*
 * ListForm - 条目配置维护表单
 * @date: 2019/01/28 11:15:59
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import ModalForm from 'components/Modal/ModalForm';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';

const promptCode = 'hpfm.dashboardClause';

@Form.create({ fieldNameProp: null })
export default class ListForm extends ModalForm {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  renderForm() {
    const {
      form: { getFieldDecorator },
      editValue,
    } = this.props;
    return (
      <React.Fragment>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.clauseCode`).d('条目代码')}
        >
          {getFieldDecorator('clauseCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.dashboard.clauseCode`).d('条目代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
            initialValue: editValue.clauseCode,
          })(<Input disabled={!!editValue.orderTypeId} typeCase="upper" inputChinese={false} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.clauseName`).d('条目名称')}
        >
          {getFieldDecorator('clauseName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.dashboard.clauseName`).d('条目名称'),
                }),
              },
              {
                max: 60,
                message: intl.get('hzero.common.validation.max', {
                  max: 60,
                }),
              },
            ],
            initialValue: editValue.clauseName,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          label={intl.get(`${promptCode}.model.dashboard.name`).d('卡片')}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
        >
          {getFieldDecorator('cardId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.dashboard.name`).d('卡片'),
                }),
              },
            ],
            initialValue: editValue.name,
          })(<Lov textValue={editValue.name} code="HPFM.DASHBOARDS_CARD" />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.dataTenantLevel`).d('层级')}
        >
          {getFieldDecorator('dataTenantLevel', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`${promptCode}.model.dashboard.dataTenantLevel`).d('层级'),
                }),
              },
            ],
            initialValue: editValue.dataTenantLevel,
          })(
            <ValueList
              lovCode="SPFM.DATA_TENANT_LEVEL"
              style={{ width: '100%' }}
              lazyLoad={false}
              allowClear
            />
          )}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.menuCode`).d('功能代码')}
        >
          {getFieldDecorator('menuCode', {
            rules: [
              {
                max: 128,
                message: intl.get('hzero.common.validation.max', {
                  max: 128,
                }),
              },
            ],
            initialValue: editValue.menuCode,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.route`).d('路由')}
        >
          {getFieldDecorator('route', {
            rules: [
              {
                max: 128,
                message: intl.get('hzero.common.validation.max', {
                  max: 128,
                }),
              },
            ],
            initialValue: editValue.route,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.statsExpression`).d('数据匹配表达式')}
        >
          {getFieldDecorator('statsExpression', {
            rules: [
              {
                max: 360,
                message: intl.get('hzero.common.validation.max', {
                  max: 360,
                }),
              },
            ],
            initialValue: editValue.statsExpression,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.docRemarkExpression`).d('单据标题表达式')}
        >
          {getFieldDecorator('docRemarkExpression', {
            rules: [
              {
                max: 360,
                message: intl.get('hzero.common.validation.max', {
                  max: 360,
                }),
              },
            ],
            initialValue: editValue.docRemarkExpression,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.remark`).d('备注')}
        >
          {getFieldDecorator('remark', {
            initialValue: editValue.remark,
          })(<Input />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get(`${promptCode}.model.dashboard.enabledFlag`).d('状态')}
        >
          {getFieldDecorator('enabledFlag', {
            initialValue: editValue.enabledFlag === 0 ? 0 : 1,
          })(<Switch />)}
        </Form.Item>
      </React.Fragment>
    );
  }
}
