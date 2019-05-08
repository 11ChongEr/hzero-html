import React from 'react';
import { Input, Icon } from 'hzero-ui';
import { isUndefined, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';

import { getResponse, getCurrentLanguage } from 'utils/utils';
import TLModal from './TLModal';
import { queryTL } from '../../services/api';

/**
 * 多语言组件 TLEditor
 *
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @extends {Component} - React.PureComponent
 * @reactProps {!boolean} [allowClear=false] - 是否允许清除
 * @reactProps {!string} [field=''] - 表单域
 * @reactProps {!string} [label = ''] - 表单label
 * @reactProps {!string} [token = ''] - 数据加密token
 * @reactProps {!string} [width = '520px'] - 模态框宽度
 * @returns React.element
 * @example
 * import TLEditor from 'components/TLEditor';
 *
 *      <FormItem
 *      label={intl.get('hpfm.country.model.country.countryName').d('国家名称')}
 *      {...formLayout}
 *      >
 *        {getFieldDecorator('countryName', {
 *          initialValue: countryName,
 *          rules: [
 *            {
 *              type: 'string',
 *              required: true,
 *              message: intl.get('hzero.common.validation.notNull', {
 *                name: intl.get('hpfm.country.model.country.countryName').d('国家名称'),
 *              }),
 *            },
 *          ],
 *        })(
 *          <TLEditor
 *            label={intl.get('hpfm.country.model.country.countryName').d('国家名称')}
 *            field="countryName"
 *            token={_token}
 *          />
 *        )}
 *      </FormItem>
 *
 */
export default class TLEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      language: getCurrentLanguage() || 'zh_CN', // 获取系统当前语言
      loading: false, // 请求多语言列表loading
      modalVisible: false, // 控制多语言模态框
      list: [], // 多语言列表
      text: props.value, // 输入框显示值
      showSuffix: true, // 显示清除按钮
    };
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { text } = this.state;
    if (text && text !== nextProps.value) {
      this.setState({ text: nextProps.value });
    }
    if (!text && nextProps.value) {
      this.setState({ text: nextProps.value });
    }
    // 当设置form.resetForm时，清空数据
    if (nextProps.value === null || nextProps.value === undefined) {
      this.setState({ list: [], text: null });
    }
  }

  @Bind()
  showLoading(flag) {
    this.setState({
      loading: flag,
    });
  }

  @Bind()
  onCancel() {
    this.setState({ modalVisible: false });
  }

  @Bind()
  save(data) {
    const { form, field: fieldName } = this.props;
    const { list, language } = this.state;
    // 设置多语言后，构建编辑的数据结构
    const newList = Object.keys(data).map(item => {
      const filterName = list.find(items => {
        return item === items.code;
      });
      return { code: item, value: data[item], name: filterName.name || '' };
    });
    this.setState({ text: data[language], list: newList, modalVisible: false });
    if (form && isUndefined(form.getFieldValue('_tls'))) {
      // 往外层form配置_tls表单域
      form.registerField('_tls');
      // 设置_tls值
      form.setFieldsValue({ _tls: { [fieldName]: data } });
    } else {
      const oldTls = form.getFieldValue('_tls');
      const newTls = { ...oldTls, [fieldName]: data };
      form.setFieldsValue({ _tls: newTls });
    }
    // 更新input显示值
    if (this.props.onChange) {
      this.props.onChange(data[language]);
    }
  }

  @Bind()
  openModal() {
    const { field: fieldName = '', token: _token = '' } = this.props;
    const { list, text, language } = this.state;
    this.showLoading(true);
    queryTL({ fieldName, _token })
      .then(res => {
        if (getResponse(res)) {
          const newRes = res.map((item, index) => {
            const obj = { ...item };
            if (isArray(list) && list[index]) {
              // 处理修改后值的回显
              if (list[index].value) {
                obj.value = list[index].value;
              }
            }
            // 处理编辑外部输入框之后
            if (language === item.code) {
              obj.value = text;
            }
            return obj;
          });
          this.setState({ modalVisible: true, list: newRes });
        }
      })
      .finally(() => {
        this.showLoading(false);
      });
  }

  @Bind()
  onChange(e) {
    this.setState({ text: e.target.value });
    if (this.props.onChange) {
      this.props.onChange(e.target.value);
    }
  }

  @Bind()
  emitEmpty() {
    if (this.props.onChange) {
      this.setState(
        {
          text: null,
        },
        () => {
          this.props.onChange(null);
        }
      );
    }
  }

  @Bind()
  showSuffix() {
    this.setState({
      showSuffix: true,
    });
  }

  @Bind()
  hiddenSuffix() {
    this.setState({
      showSuffix: false,
    });
  }

  @Bind()
  afterButton() {
    const { disabled = false } = this.props;
    if (this.state.loading) {
      return <Icon type="loading" />;
    } else if (disabled) {
      return <Icon type="global" style={{ cursor: 'not-allowed' }} />;
    } else {
      return <Icon type="global" onClick={this.openModal} style={{ cursor: 'pointer' }} />;
    }
  }

  render() {
    const {
      allowClear = false,
      field: fieldName,
      label = '',
      width,
      inputSize = {},
      ...otherProps
    } = this.props;
    const { text, modalVisible, list, showSuffix } = this.state;
    const modalProps = {
      label,
      fieldName,
      modalVisible,
      list,
      width,
      inputSize,
      onCancel: this.onCancel,
      onOK: this.save,
    };
    const suffix = (
      <Icon
        type="close-circle"
        onClick={this.emitEmpty}
        onMouseOver={this.showSuffix}
        onMouseOut={this.hiddenSuffix}
        onFocus={this.showSuffix}
        onBlur={this.hiddenSuffix}
      />
    );
    return (
      <React.Fragment>
        <Input
          addonAfter={this.afterButton()}
          value={text}
          suffix={allowClear && text && showSuffix && suffix}
          onChange={this.onChange}
          {...otherProps}
        />
        <TLModal {...modalProps} />
      </React.Fragment>
    );
  }
}
