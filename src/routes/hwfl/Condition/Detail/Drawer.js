import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select, InputNumber } from 'hzero-ui';
import { isUndefined, isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 跳转条件-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * state初始化
   */
  state = {
    leftOperandList: [], // 左操作数列表
    rightOperandList: [], // 右操作数列表
  };

  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: e => e,
    onCancel: e => e,
  };
  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.itemData.leftType !== this.props.itemData.leftType ||
      nextProps.itemData.rightType !== this.props.itemData.rightType
    ) {
      this.searchLeftOperand(nextProps.itemData.leftType);
      this.searchRightOperand(nextProps.itemData.rightType);
    }
  }

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, onEditOk, itemData } = this.props;
    const { expressionDefinitionLineId } = itemData;
    if (onOk && onEditOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 校验通过，进行保存操作
          if (isEmpty(itemData)) {
            onOk({ ...values, code: +values.code });
          } else {
            onEditOk({
              ...values,
              expressionDefinitionLineId,
              code: +values.code,
            });
          }
        }
      });
    }
  }

  // 根据左操作数类型查询左操作数列表
  @Bind()
  searchLeftOperand(parameterType) {
    const { dispatch, tenantId } = this.props;
    if (parameterType !== 'service') {
      dispatch({
        type: 'condition/fetchVariableOperand',
        payload: { tenantId, parameterType },
      }).then(res => {
        if (res) {
          this.setState({
            leftOperandList: res,
          });
        }
      });
    } else {
      dispatch({
        type: 'condition/fetchServiceOperand',
        payload: { tenantId },
      }).then(res => {
        if (res) {
          this.setState({
            leftOperandList: res,
          });
        }
      });
    }
  }

  // 根据右操作数类型查询右操作数列表
  @Bind()
  searchRightOperand(parameterType) {
    const { dispatch, tenantId } = this.props;
    if (parameterType !== 'service') {
      dispatch({
        type: 'condition/fetchVariableOperand',
        payload: { tenantId, parameterType },
      }).then(res => {
        if (res) {
          this.setState({
            rightOperandList: res,
          });
        }
      });
    } else {
      dispatch({
        type: 'condition/fetchServiceOperand',
        payload: { tenantId },
      }).then(res => {
        if (res) {
          this.setState({
            rightOperandList: res,
          });
        }
      });
    }
  }

  /**
   * 左操作数类型变更
   */
  @Bind()
  handleChangeLeftType(value) {
    this.searchLeftOperand(value);
    this.props.form.setFieldsValue({ leftOperand: undefined });
    this.props.form.setFieldsValue({ leftOperandText: undefined });
  }

  /**
   * 右操作数类型变更
   */
  @Bind()
  handleChangeRightType(value) {
    this.searchRightOperand(value);
    this.props.form.setFieldsValue({ rightOperand: undefined });
    this.props.form.setFieldsValue({ rightOperandText: undefined });
  }

  @Bind()
  selectLeft(value, options) {
    this.props.form.setFieldsValue({ leftOperandText: options.props.children });
  }

  @Bind()
  selectRight(value, options) {
    this.props.form.setFieldsValue({ rightOperandText: options.props.children });
  }

  /**
   * 条件编码唯一性校验
   * @param {!object} rule - 规则
   * @param {!string} value - 表单值
   * @param {!Function} callback
   */
  @Bind()
  checkUnique(rule, value, callback) {
    const { ruleList, itemData } = this.props;
    if (isUndefined(itemData.code)) {
      // 非编辑时，校验规则编码是否重复
      const target = ruleList.find(item => item.code === +value);
      if (target) {
        callback(
          intl.get('hwfl.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, visible, title, form, itemData, onCancel, operator, dataType } = this.props;
    const { getFieldDecorator } = form;
    const { leftOperandList, rightOperandList } = this.state;
    return (
      <Modal
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        <Form>
          <Form.Item
            label={intl.get('hwfl.condition.model.rule.code').d('规则编号')}
            {...formLayout}
          >
            {getFieldDecorator('code', {
              initialValue: itemData.code,
              validateFirst: true,
              validate: isUndefined(itemData.code)
                ? [
                    {
                      trigger: 'onBlur',
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hwfl.condition.model.rule.code').d('规则编号'),
                          }),
                        },
                      ],
                    },
                    {
                      trigger: 'onBlur',
                      rules: [{ validator: this.checkUnique }],
                    },
                  ]
                : [{ trigger: 'onBlur', rules: [{ required: true }] }],
            })(
              <InputNumber
                disabled={isNumber(itemData.expressionDefinitionLineId)}
                min={0}
                step={1}
                style={{ width: '100%' }}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.rule.description').d('规则描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.rule.description').d('规则描述'),
                  }),
                },
              ],
              initialValue: itemData.description,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.rule.leftType').d('左操作数类型')}
            {...formLayout}
          >
            {getFieldDecorator('leftType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.rule.leftType').d('左操作数类型'),
                  }),
                },
              ],
              initialValue: itemData.leftType,
            })(
              <Select onChange={this.handleChangeLeftType}>
                {dataType.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.rule.leftOperandText').d('左操作数')}
            {...formLayout}
          >
            {getFieldDecorator('leftOperand', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.rule.leftOperandText').d('左操作数'),
                  }),
                },
              ],
              initialValue: itemData.leftOperand,
            })(
              <Select onChange={this.selectLeft}>
                {leftOperandList.map(item => (
                  <Select.Option
                    key={item.externalDefinitionId || item.processVariableId}
                    value={item.code}
                  >
                    {item.description}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item style={{ display: 'none' }} {...formLayout}>
            {getFieldDecorator('leftOperandText', {
              initialValue: itemData.leftOperandText,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.rule.operator').d('操作符')}
            {...formLayout}
          >
            {getFieldDecorator('operator', {
              initialValue: itemData.operator,
              rules: [
                {
                  // required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.rule.operator').d('操作符'),
                  }),
                },
              ],
            })(
              <Select allowClear>
                {operator.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.rule.rightType').d('右操作数类型')}
            {...formLayout}
          >
            {getFieldDecorator('rightType', {
              rules: [
                {
                  required: !!form.getFieldValue('operator'),
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.rule.rightType').d('右操作数类型'),
                  }),
                },
              ],
              initialValue: itemData.rightType,
            })(
              <Select
                onChange={this.handleChangeRightType}
                allowClear={!!form.getFieldValue('operator')}
              >
                {dataType.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.rule.rightOperantText').d('右操作数')}
            {...formLayout}
          >
            {getFieldDecorator('rightOperand', {
              rules: [
                {
                  required: !!form.getFieldValue('operator'),
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.rule.rightOperantText').d('右操作数'),
                  }),
                },
              ],
              initialValue: itemData.rightOperand,
            })(
              <Select onChange={this.selectRight} allowClear={!!form.getFieldValue('operator')}>
                {rightOperandList.map(item => (
                  <Select.Option
                    key={item.externalDefinitionId || item.processVariableId}
                    value={item.code}
                  >
                    {item.description}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item style={{ display: 'none' }} {...formLayout}>
            {getFieldDecorator('rightOperandText', {
              initialValue: itemData.rightOperandText,
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
