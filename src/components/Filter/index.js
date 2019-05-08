// todo Filter 组件的一部分

import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import { Form, Row, Col, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import styles from './index.less';

const FormItem = Form.Item;
const SearchInput = Input.Search;

const defaultColGridProps = {
  4: {
    lg: 6,
    md: 8,
    sm: 24,
  },
  3: {
    lg: 8,
    md: 8,
    sm: 24,
  },
  2: {
    lg: 12,
    md: 12,
    sm: 24,
  },
  1: {
    lg: 24,
    md: 24,
    sm: 24,
  },
};
const defaultFormItemLayout = {
  4: {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  },
  3: {
    labelCol: { span: 7 },
    wrapperCol: { span: 17 },
  },
  2: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  1: {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  },
};
/**
 * 存储转化 type 到输入组件的方法集合
 * @type {{default: (function(*): *), search: (function(*): *)}}
 */
const fieldComponentParseMap = {
  default: filter =>
    filter.name ? (
      <Input
        onChange={value => {
          if (filter.onChange) {
            filter.onChange(value, this.props.form);
          }
        }}
        key={`input_${filter.field}`}
        {...filter.inputProps}
      />
    ) : (
      false
    ),
  search: filter => <SearchInput {...filter.inputProps} />,
};

@Bind()
export default class Filter extends PureComponent {
  // static defaultProps = {
  //   onBeforeFormReset: null,
  //   onFormReset: null,
  //   rowType: null,
  //   // 输入组件(包含label)之间的间隙
  //   gutter: 0,
  //   // Filter 是否在 loading 状态
  //   loading: false,
  //   hideSubmit: false,
  // };
  // static propTypes = {
  //   // 是否隐藏查询 和 重置 按钮
  //   hideSubmit: PropTypes.bool,
  //   // 表单查询按钮点击,且数据验证通过
  //   rowType: PropTypes.string,
  //   // 输入组件(包含label)之间的间隙
  //   gutter: PropTypes.number,
  //   // Filter 是否在 loading 状态
  //   loading: PropTypes.bool,
  //   // 表单查询按钮点击,且数据验证通过
  //   onFilterChange: PropTypes.func.isRequired,
  //   // 在表单重置之前 调用的方法(同步)
  //   onBeforeFormReset: PropTypes.func,
  //   // 替换掉 Filter 组件 自带的重置表单的方法
  //   onFormReset: PropTypes.func,
  //   // 输入组件的属性
  //   filters: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       // form 表单 编码
  //       field: PropTypes.string,
  //       // formItem label 值
  //       name: PropTypes.string,
  //       // 输入组件的类型
  //       type: PropTypes.oneOf('default', 'search'),
  //       // 表单的初始值
  //       value: PropTypes.string,
  //       // 输入组件 值改变的回调
  //       onChange: PropTypes.func,
  //       // 输入组件的其他属性
  //       inputProps: PropTypes.object,
  //       // 校验内容
  //       rules: PropTypes.arrayOf(PropTypes.object),
  //     })
  //   ).isRequired,
  // };
  /**
   * 获取 Filter Items
   * 由于 antd 的 Form 值更新必须 元数据更新 触发,getFieldDecorator 获取新的值,
   * 所以 inputItems 不能做缓存
   * @return {Array}
   */
  getInputItems() {
    this.inputItems = [];
    const col = this.props.col || 4;
    const emptyInputItem = <div style={{ height: '32px', marginTop: '8px' }} />;
    this.props.filters.forEach((filter, index) => {
      if (filter) {
        const currentCol = filter.col || col;
        const key = `filterItem_${filter.field || index}`;
        const colProps = defaultColGridProps[currentCol];
        const formItemLayout =
          filter.formItemLayout || this.props.formItemLayout || defaultFormItemLayout[currentCol];
        const inputComponent = fieldComponentParseMap[filter.type]
          ? fieldComponentParseMap[filter.type](filter)
          : fieldComponentParseMap.default(filter);
        let formItemClassName = styles.formItem;
        if (filter.suffix) {
          formItemClassName += ` ${styles.suffix}`;
        }
        const realInputComponent = inputComponent ? (
          <FormItem
            colon
            label={filter.name}
            className={formItemClassName}
            style={{
              display: filter.isHide ? 'none' : 'inline-block',
            }}
            key={filter.key}
            {...formItemLayout}
          >
            {filter.field
              ? this.props.form.getFieldDecorator(filter.field, {
                  initialValue: filter.value,
                  valuePropName: filter.valuePropName || 'value',
                  rules: filter.rules,
                })(inputComponent)
              : inputComponent}
          </FormItem>
        ) : (
          emptyInputItem
        );
        this.inputItems.push(
          <Col {...colProps} key={key} style={{ ...filter.colStyle }} className={styles.filterItem}>
            {realInputComponent}
            {filter.suffix ? <span className={styles.suffix}>{filter.suffix}</span> : ''}
          </Col>
        );
      }
    });
    (this.props.appendFilters || []).forEach((r, index) => {
      const currentCol = r.col || col;
      this.inputItems.push(
        <Col
          {...currentCol}
          // eslint-disable-next-line react/no-array-index-key
          key={`appendItem_${index}`}
          style={{ marginTop: '8px', ...r.colStyle }}
        >
          <div
            style={{
              width: r.suffix ? '270px' : '100%',
              display: r.isHide ? 'none' : 'inline-block',
            }}
          >
            {r.$component}
          </div>
        </Col>
      );
    });
    return this.inputItems;
  }

  /**
   * 点击查询按钮
   */
  handleSearch() {
    const { onFilterChange, filters } = this.props;
    if (onFilterChange) {
      const fieldNames = filters.map(item => item.field);
      // Filter 验证数据
      this.props.form.validateFields(fieldNames, {}, (err, values) => {
        if (!err) {
          // 如果验证成功,则执行 onOk
          this.props.onFilterChange(values);
        }
      });
    }
  }

  /**
   * 重置查询表单
   */
  handleReset = () => {
    const {
      // 在重置表单之前做的事情
      onBeforeFormReset,
      // 替代 Filter 重置表单的方法
      onFormReset,
      form: { getFieldsValue, setFieldsValue },
    } = this.props;
    if (onBeforeFormReset) {
      onBeforeFormReset();
    }
    if (onFormReset) {
      onFormReset();
    } else {
      const fields = getFieldsValue();
      for (const item in fields) {
        if ({}.hasOwnProperty.call(fields, item)) {
          if (fields[item] instanceof Array) {
            fields[item] = [];
          } else {
            fields[item] = undefined;
          }
        }
      }
      setFieldsValue(fields);
    }
  };

  render() {
    const inputItems = this.getInputItems();
    const { rowType, gutter, loading } = this.props;
    return (
      <div className={styles.wrap}>
        <Form>
          <Row type={rowType} gutter={gutter}>
            {inputItems}
          </Row>
          {this.props.hideSubmit || (
            <Row gutter={8} className={styles.btnPanel}>
              <Col span={10}>
                <Button
                  data-code="search"
                  loading={loading}
                  htmlType="submit"
                  type="primary"
                  onClick={this.handleSearch}
                >
                  搜索
                </Button>
                {this.props.children}
                <Button data-code="reset" onClick={this.handleReset}>
                  重置
                </Button>
              </Col>
              <Col span={14}>{this.props.rightButtonArea}</Col>
            </Row>
          )}
        </Form>
      </div>
    );
  }
}
