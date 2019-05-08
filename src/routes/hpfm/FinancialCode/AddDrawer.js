import React, { Component } from 'react';
import { Drawer, Form, Input, Select, Switch, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNil, isEmpty } from 'lodash';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import styles from './index.less';
// 使用 FormItem 组件
const FormItem = Form.Item;
// 使用 Option 组件
const { Option } = Select;
// 使用 TextArea 组件
const { TextArea } = Input;
// 通用表单布局
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

// hpfm 国际化前缀
const commonPrompt = 'hpfm.financialCode.view.message';
/**
 * SlideDrawer - 财务代码设置 编辑侧滑弹窗组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [updateLoading=false] - 编辑保存状态
 * @reactProps {boolean} visible - 弹窗是否可见
 * @reactProps {Array<object>} typeList - 状态下拉框值集
 * @reactProps {object} editRecord - 选择编辑的行数据
 * @reactProps {function} [onOk = (e => e)] - 弹窗确定时执行
 * @reactProps {function} [onClose = (e => e)] - 弹窗关闭时执行
 * @reactProps {object} form - 表单对象
 */
@Form.create({ fieldNameProp: null })
export default class SlideDrawer extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      valueMeaning: null,
      currentTag: null,
      typeList: [],
    };
  }

  /**
   * 挂载完成时执行
   */
  componentDidMount() {
    this.initTypeList();
  }

  /**
   * 更新完成时执行
   */
  componentDidUpdate(prevProps) {
    const { visible } = this.props;
    if (visible && !prevProps.visible) {
      this.initTypeList();
    }
  }

  /**
   * initTypeList - 挂载完成时获取类型值集
   */
  @Bind()
  initTypeList() {
    const { typeList } = this.props;
    this.setState({
      typeList,
    });
  }

  /**
   * handleSelectChange - 下拉组件改变时触发
   * @param {Array} value - 类型值集的 orderSeq 字段组成的数组
   */
  @Bind()
  handleSelectChange(value = []) {
    const orderSeq = value[0];
    const {
      typeList = [],
      form: { setFieldsValue = e => e },
    } = this.props;
    const currentTag = (typeList.find(o => Number(o.orderSeq) === Number(orderSeq)) || {}).tag;
    const valueMeaning = (typeList.find(o => o.value === currentTag) || {}).meaning;
    const group = (typeList.find(o => o.orderSeq === orderSeq) || {}).parentValue;
    this.setState({
      valueMeaning,
      currentTag,
      typeList: group
        ? typeList.filter(n => n.parentValue === group && n.tag === currentTag)
        : value.length === 0
        ? typeList
        : typeList.filter(o => isNil(o.parentValue)),
    });
    setFieldsValue({ codeId: undefined });
  }

  render() {
    const { valueMeaning, currentTag, typeList = [] } = this.state;
    const {
      visible,
      onOk,
      onClose,
      form: { getFieldDecorator },
      saveLoading,
    } = this.props;
    return (
      <Drawer
        title={intl.get(`${commonPrompt}.createTitle`).d('新建财务代码')}
        visible={visible}
        onClose={onClose}
        width={450}
        destroyOnClose
      >
        <div className={styles['financial-code-drawer']}>
          <Form layout="vertical">
            <FormItem label={intl.get(`${commonPrompt}.financialCode`).d('代码')} {...formLayout}>
              {getFieldDecorator('code', {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`${commonPrompt}.code`).d('代码'),
                      })
                      .d(`${intl.get(`${commonPrompt}.code`).d('代码')}不能为空`),
                  },
                ],
              })(<Input inputChinese={false} />)}
            </FormItem>
            <FormItem label={intl.get(`${commonPrompt}.financialName`).d('名称')} {...formLayout}>
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`${commonPrompt}.name`).d('名称'),
                      })
                      .d(`${intl.get(`${commonPrompt}.name`).d('名称')}不能为空`),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={intl.get(`${commonPrompt}.financialType`).d('类型')} {...formLayout}>
              {getFieldDecorator('types', {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.notNull`, {
                        name: intl.get(`${commonPrompt}.types`).d('类型'),
                      })
                      .d(`${intl.get(`${commonPrompt}.types`).d('类型')}不能为空`),
                  },
                ],
              })(
                <Select mode="multiple" onChange={this.handleSelectChange}>
                  {typeList.map(n => (
                    <Option key={n.orderSeq} value={n.orderSeq}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
            <FormItem
              label={intl
                .get(`${commonPrompt}.superior${valueMeaning}`)
                .d(`上级${valueMeaning || ''}`)}
              {...formLayout}
            >
              {getFieldDecorator('codeId', {
                rules: [].concat(
                  !isEmpty(currentTag)
                    ? {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.notNull`, {
                            name: intl.get(`${commonPrompt}.types`).d('类型'),
                          })
                          .d(`${intl.get(`${commonPrompt}.types`).d('类型')}不能为空`),
                      }
                    : {}
                ),
              })(
                <Lov
                  code="HPFM.FINANCE_CODE"
                  queryParams={{ tenantId: getCurrentOrganizationId(), type: currentTag }}
                />
              )}
            </FormItem>
            <FormItem label={intl.get(`${commonPrompt}.describe`).d('说明')} {...formLayout}>
              {getFieldDecorator('remark')(<TextArea rows={3} />)}
            </FormItem>
            <FormItem label={intl.get(`${commonPrompt}.enable`).d('启用')} {...formLayout}>
              {getFieldDecorator('enabledFlag', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Switch
                  checkedChildren={intl.get(`${commonPrompt}.open`).d('开')}
                  unCheckedChildren={intl.get(`${commonPrompt}.close`).d('关')}
                />
              )}
            </FormItem>
            <div className="drawer-bottom">
              <Button onClick={onClose}>{intl.get(`hzero.common.button.cancel`).d('取消')}</Button>
              <Button
                style={{ marginLeft: '8px' }}
                type="primary"
                onClick={onOk}
                loading={saveLoading}
              >
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
            </div>
          </Form>
        </div>
      </Drawer>
    );
  }
}
