import React from 'react';
import { Modal, Input, Icon, Button, message } from 'hzero-ui';
import { isEmpty, isFunction, omit, isNil } from 'lodash';
import { Bind, Debounce, Throttle } from 'lodash-decorators';
import intl from 'utils/intl';
import LovModal from './LovModal';
import { open } from '../Modal/ModalContainer';
import { queryLov } from '../../services/api';
import './index.less';

const defaultRowKey = 'key';
export default class Lov extends React.Component {
  // 当前 LOV 窗口
  modal;

  // 选中记录
  record;

  loading = false;

  constructor(props) {
    super(props);
    this.state = {
      currentText: null,
      text: props.isInput ? props.value : props.textValue,
      textField: props.textField,
      lov: {},
      loading: false,
    };
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { currentText, text } = this.state;
    let data = {
      currentText: nextProps.textValue === currentText ? currentText : nextProps.textValue,
    };

    if (currentText && currentText !== nextProps.textValue) {
      data = {
        ...data,
        text: nextProps.textValue,
      };
    }
    if (!text && nextProps.textValue) {
      data = {
        ...data,
        text: nextProps.textValue,
      };
    }
    if (nextProps.value === null || nextProps.value === undefined) {
      data = {
        ...data,
        text: null,
      };
    }
    if (nextProps.isInput) {
      data = {
        ...data,
        text: nextProps.value,
      };
    }

    this.setState({
      ...data,
    });
  }

  @Bind()
  onSelect(record) {
    this.record = record;
  }

  @Bind()
  selectAndClose() {
    if (!this.record) {
      Modal.warning({
        title: intl.get('hzero.common.validation.at-least-one-record').d('请选择一条数据'),
      });
      return false;
    }
    this.selectRecord(this.record);
    if (this.modal) {
      this.modal.close();
    }
  }

  getTextField() {
    const { form } = this.props;
    const { textField } = this.state;
    if (form && textField) {
      form.registerField(textField);
    }
    return textField;
  }

  selectRecord() {
    const { isInput } = this.props;
    const { valueField: rowkey = defaultRowKey, displayField: displayName } = this.state.lov;

    // TODO: 值为 0 -0 '' 等的判断

    this.setState(
      {
        text: this.parseField(this.record, displayName),
      },
      () => {
        const { form } = this.props;
        const textField = this.getTextField();
        if (form && textField) {
          form.setFieldsValue({
            [textField]: this.parseField(this.record, displayName),
          });
        }
        // 设置额外表单值
        if (form && this.props.extSetMap) {
          this.setExtMapToForm(this.record, this.props.extSetMap, form);
        }

        if (this.props.onChange) {
          const valueField = isInput ? displayName : rowkey;
          this.props.onChange(this.parseField(this.record, valueField), this.record);
        }
        if (isFunction(this.props.onOk)) {
          this.props.onOk(this.record);
        }
        this.record = null;
      }
    );
  }

  /**
   * 设置额外表单值
   * @param {Object} record 数据对象
   * @param {String} extSetMap 额外字段映射, 可以有多个, 以逗号分隔 bankId,bankName->bankDescription
   * @param {表单对象} form 表单对象
   */
  setExtMapToForm(record, extSetMap, form) {
    const dataSet = {};
    extSetMap.split(/\s*,\s*/g).forEach(entryStr => {
      const [recordField, formFieldTmp] = entryStr.split('->');
      const formField = formFieldTmp || recordField;
      form.getFieldDecorator(formField);
      dataSet[formField] = record[recordField];
    });
    form.setFieldsValue(dataSet);
  }

  @Bind()
  onCancel() {
    const { onCancel = e => e } = this.props;
    if (isFunction(onCancel)) {
      onCancel();
    }
    this.record = null;
  }

  componentWillUnmount() {
    this.showLoading.cancel();
  }

  @Debounce(500)
  showLoading() {
    this.setState({
      loading: true,
    });
  }

  hideLoading() {
    this.showLoading.cancel();
    this.setState({
      loading: false,
    });
  }

  @Bind()
  modalWidth(tableFields) {
    let width = 100;
    tableFields.forEach(n => {
      width += n.width;
    });
    return width;
  }

  @Bind()
  onSearchBtnClick() {
    const {
      disabled = false,
      queryParams = {},
      onClick = e => e,
      lovOptions: { valueField: customValueField, displayField: customDisplayField } = {},
    } = this.props;
    if (disabled || this.loading) return; // 节流

    this.record = null;
    const { code: viewCode } = this.props;
    this.loading = true;
    this.showLoading();
    queryLov({ viewCode })
      .then(oriLov => {
        const lov = { ...oriLov };
        if (customValueField) {
          lov.valueField = customValueField;
        }
        if (customDisplayField) {
          lov.displayField = customDisplayField;
        }
        if (!isEmpty(lov)) {
          const { viewCode: hasCode, title, tableFields } = lov;
          if (hasCode) {
            const width = this.modalWidth(tableFields);
            this.setState({ lov });
            this.modal = open({
              title,
              width,
              wrapClassName: 'lov-modal',
              maskClosable: false,
              onOk: this.selectAndClose,
              bodyStyle: title ? { padding: '16px' } : { padding: '56px 16px 0' },
              onCancel: this.onCancel,
              style: {
                minWidth: 400,
              },
              children: (
                <LovModal
                  lov={lov}
                  width={width}
                  queryParams={queryParams}
                  onSelect={this.onSelect}
                  onClose={this.selectAndClose}
                />
              ),
            });
            if (isFunction(onClick)) {
              onClick();
            }
          } else {
            message.error('值集视图未定义!');
          }
        }
      })
      .finally(() => {
        this.hideLoading();
        this.loading = false;
      });
  }

  searchButton() {
    if (this.state.loading) {
      return <Icon key="search" type="loading" />;
    } else {
      return (
        <Icon
          key="search"
          type="search"
          onClick={this.onSearchBtnClick}
          style={{ cursor: 'pointer', color: '#666' }}
        />
      );
    }
  }

  @Bind()
  emitEmpty() {
    const { text, lov } = this.state;
    const { form, onClear = e => e, value } = this.props;
    if (this.props.onChange) {
      const record = {};
      this.setState(
        {
          text: '',
        },
        () => {
          this.props.onChange(undefined, record);
          const textField = this.getTextField();
          if (form && textField) {
            form.setFieldsValue({
              [textField]: undefined,
            });
          }
        }
      );
    }
    // TODO: 当初次进入时的情况
    if (isFunction(onClear)) {
      const record = {
        [lov.displayField]: text,
        [lov.valueField]: value,
      };
      onClear(record);
    }
  }

  /**
   * 访问对象由字符串指定的多层属性
   * @param {Object} obj 访问的对象
   * @param {String} str 属性字符串，如 'a.b.c.d'
   */
  @Bind()
  parseField(obj, str) {
    if (/[.]/g.test(str)) {
      const arr = str.split('.');
      const newObj = obj[arr[0]];
      const newStr = arr.slice(1).join('.');
      return this.parseField(newObj, newStr);
    } else {
      return obj[str];
    }
  }

  /**
   * 同步 Lov 值节流以提高性能
   * @param {String} value - Lov 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  /**
   * 同步输入值至 Input 及 Lov
   * @param {String} value - 输入框内的值
   */
  @Bind()
  setText(value) {
    const { isInput } = this.props;
    if (isInput) {
      this.setState(
        {
          text: value,
        },
        () => {
          this.setValue(value);
        }
      );
    }
  }

  render() {
    const { text: stateText } = this.state;
    const {
      form,
      value,
      textValue,
      queryParams,
      style,
      isButton,
      isInput,
      allowClear = true,
      ...otherProps
    } = this.props;
    const textField = this.getTextField();
    let text;
    const omitProps = ['onOk', 'onCancel', 'onClick', 'onClear', 'textField', 'lovOptions'];
    if (isInput) {
      text = stateText;
      omitProps.push('onChange');
    } else {
      text = isNil(value)
        ? ''
        : (textField ? form && form.getFieldValue(textField) : stateText) || textValue;
    }
    const inputStyle = isButton
      ? style
      : {
          ...style,
          verticalAlign: 'middle',
          position: 'relative',
          top: -1,
        };
    const isDisabled = this.props.disabled !== undefined && !!this.props.disabled;
    const showSuffix = text && allowClear && !isButton && !isDisabled;
    const suffix = (
      <React.Fragment>
        <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.emitEmpty} />
        {this.searchButton()}
      </React.Fragment>
    );
    return isButton ? (
      <Button onClick={this.onSearchBtnClick} {...otherProps} />
    ) : (
      <Input
        readOnly={!isInput}
        // addonAfter={this.searchButton()}
        value={text}
        style={inputStyle} // Lov 组件垂直居中样式，作用于 ant-input-group-wrapper
        className={`${!isButton && 'lov-input'}${showSuffix ? ' lov-suffix' : ''} ${
          isDisabled ? 'lov-disabled' : ''
        }`}
        suffix={suffix}
        onChange={e => this.setText(e.target.value)}
        {...omit(otherProps, omitProps)}
      />
    );
  }
}
