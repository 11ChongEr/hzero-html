import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Spin, Row, Col, DatePicker, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { some, isArray } from 'lodash';
import moment from 'moment';

import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';

import styles from './index.less';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

/**
 * 数据集查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  getCurrentComponent(item) {
    let component;
    switch (item.type) {
      case 'Lov': // Lov
        component = <Lov code={item.businessModel} />;
        break;
      case 'Input': // 文本
        component = <Input />;
        break;
      case 'Checkbox': // 勾选框
        component = <Checkbox />;
        break;
      case 'Select': // 下拉框
        component = item.multipled ? (
          <ValueList
            mode="multiple"
            style={{ width: '100%' }}
            options={item.value}
            allowClear={!item.isRequired}
          />
        ) : (
          <ValueList style={{ width: '100%' }} options={item.value} allowClear={!item.isRequired} />
        );
        break;
      case 'DatePicker': // 日期选择框
        component = (
          <DatePicker style={{ width: '100%' }} placeholder="" format={this.props.dateFormat} />
        );
        break;
      case 'InputNumber': // 数字框
        component = <InputNumber style={{ width: '100%' }} />;
        break;
      default:
        component = <Input />;
        break;
    }
    return component;
  }

  // 渲染参数组件
  @Bind()
  renderParamGroup(paramList = []) {
    const {
      form: { getFieldDecorator },
      dateFormat,
    } = this.props;
    return paramList.map(item => {
      let { defaultValue } = item;
      if (item.type === 'Select' || item.type === 'Lov') {
        const defaultFlag = some(
          isArray(item.value) ? item.value : item.value.split(','),
          item.defaultValue
        );
        if (item.multipled) {
          defaultValue = item.defaultValue && defaultFlag ? item.defaultValue.split(',') : [];
        }
        defaultValue = defaultFlag ? item.defaultValue : undefined;
      } else if (item.type === 'Checkbox') {
        defaultValue = item.defaultValue ? parseInt(item.defaultValue, 10) : undefined;
      } else if (item.type === 'DatePicker') {
        defaultValue = item.defaultValue ? moment(item.defaultValue, dateFormat) : undefined;
      }

      return (
        <Col span={8} key={item.name}>
          <Form.Item label={item.text} {...formLayout}>
            {getFieldDecorator(`${item.name}`, {
              initialValue: defaultValue,
              rules: [
                {
                  required: item.formElement === 'Checkbox' ? false : item.isRequired !== 0,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: item.text,
                    })
                    .d(`${item.text}不能为空`),
                },
              ],
            })(this.getCurrentComponent(item))}
          </Form.Item>
        </Col>
      );
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { fetchParamsLoading, formElements = [] } = this.props;
    return (
      <Fragment>
        {/* <Divider orientation="left">{intl.get('hrpt.reportQuery.view.message.reportParams').d('报表参数')}</Divider> */}
        {formElements.length !== 0 && (
          <div className={styles['model-title']}>
            {intl.get('hrpt.reportQuery.view.message.reportParams').d('报表参数')}
          </div>
        )}
        <Spin spinning={fetchParamsLoading}>
          <Row type="flex">{this.renderParamGroup(formElements)}</Row>
        </Spin>
      </Fragment>
    );
  }
}
