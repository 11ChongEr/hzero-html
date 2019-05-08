/**
 * PreferenceInfo.js
 * @date 2018/11/27
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { Button, Form, Select } from 'hzero-ui';

import Lov from 'components/Lov';

import intl from 'utils/intl';

import Main from './components/Main';
import Content from './components/Content';
import MaxLenItem from './components/MaxLenItem';

import styles from './index.less';

import DateTimeFormat from './DateTimeFormat';

const itemContentStyle = { width: 240 };
const btnStyle = { marginLeft: 8 };

@Form.create({ fieldNameProp: null })
export default class PreferenceInfo extends React.Component {
  state = {
    timeZoneProps: { editing: false },
    languageProps: { editing: false },
  };

  componentDidMount() {
    const { initLanguageMap, initDateMap, initTimeMap } = this.props;
    initLanguageMap();
    initDateMap();
    initTimeMap();
  }

  render() {
    const {
      userInfo,
      dateMap,
      timeMap,
      onDateFormatUpdate,
      onTimeFormatUpdate,
      updateDateFormatLoading,
      updateTimeFormatLoading,
    } = this.props;
    return (
      <div className={styles.preference}>
        <Main title={intl.get('hiam.userInfo.view.title.main.preferenceSetting').d('偏好设置')}>
          <Content>
            {this.renderTimeZone()}
            {this.renderLanguage()}
            {
              <DateTimeFormat
                userInfo={userInfo}
                dateMap={dateMap}
                timeMap={timeMap}
                onDateFormatUpdate={onDateFormatUpdate}
                onTimeFormatUpdate={onTimeFormatUpdate}
                updateDateFormatLoading={updateDateFormatLoading}
                updateTimeFormatLoading={updateTimeFormatLoading}
              />
            }
          </Content>
        </Main>
      </div>
    );
  }

  // time-zone
  renderTimeZone() {
    const { userInfo = {}, form, updateTimeZoneLoading } = this.props;
    const {
      timeZoneProps: { editing = false },
    } = this.state;
    let content = userInfo.timeZoneMeaning;
    const comment = intl
      .get('hiam.userInfo.view.message.timeZone')
      .d('时区首选项，用于用户切换时区');
    const btns = [];
    if (editing) {
      // comment = '';
      content = (
        <React.Fragment>
          {form.getFieldDecorator('timeZone', {
            initialValue: userInfo.timeZone,
          })(
            <Lov
              code="HIAM.TIME_ZONE"
              textValue={userInfo.timeZoneMeaning}
              textField="timeZoneMeaning"
              style={itemContentStyle}
              allowClear={false}
            />
          )}
          <Button
            type="primary"
            style={btnStyle}
            loading={updateTimeZoneLoading}
            onClick={this.handleTimeZoneUpdate}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button style={btnStyle} onClick={this.handleTimeZoneEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </React.Fragment>
      );
    } else {
      btns.push(
        <Button key="update" onClick={this.handleTimeZoneEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <MaxLenItem
        key="time-zone"
        itemIcon={null}
        description={intl.get('hiam.userInfo.model.user.timeZone').d('时区切换')}
        content={content}
        comment={comment}
        btns={btns}
      />
    );
  }

  @Bind()
  handleTimeZoneEdit() {
    this.setState({ timeZoneProps: { editing: true } });
  }

  @Bind()
  handleTimeZoneEditCancel() {
    this.setState({ timeZoneProps: { editing: false } });
  }

  @Bind()
  handleTimeZoneUpdate() {
    const { form } = this.props;
    form.validateFields(['timeZone', 'timeZoneMeaning'], (err, data) => {
      const { onTimeZoneUpdate } = this.props;
      onTimeZoneUpdate(data).then(res => {
        if (res) {
          this.handleTimeZoneEditCancel();
        }
      });
    });
  }

  // language
  renderLanguage() {
    const { userInfo = {}, languageMap = {}, form, updateLanguageLoading } = this.props;
    const {
      languageProps: { editing = false },
    } = this.state;
    let content = userInfo.languageName;
    const btns = [];
    const comment = intl.get('view.message.language').d('语言首选项，用于用户切换语言');
    if (editing) {
      // comment = '';
      content = (
        <React.Fragment>
          {form.getFieldDecorator('language', {
            initialValue: userInfo.language,
          })(
            <Select style={itemContentStyle}>
              {Object.values(languageMap).map(item => (
                <Select.Option key={item.code} value={item.code}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          )}
          <Button
            key="save"
            style={btnStyle}
            loading={updateLanguageLoading}
            onClick={this.handleLanguageUpdate}
            type="primary"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button key="cancel" style={btnStyle} onClick={this.handleLanguageEditCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </React.Fragment>
      );
    } else {
      btns.push(
        <Button key="update" onClick={this.handleLanguageEdit}>
          {intl.get('hzero.common.button.update').d('修改')}
        </Button>
      );
    }
    return (
      <MaxLenItem
        itemIcon={null}
        description={intl.get('hiam.userInfo.model.user.language').d('语言切换')}
        content={content}
        comment={comment}
        btns={btns}
      />
    );
  }

  @Bind()
  handleLanguageEdit() {
    this.setState({
      languageProps: { editing: true },
    });
  }

  @Bind()
  handleLanguageEditCancel() {
    this.setState({
      languageProps: { editing: false },
    });
  }

  @Bind()
  handleLanguageUpdate() {
    const { form } = this.props;
    form.validateFields(['language'], (err, data) => {
      if (!err) {
        const { onLanguageUpdate } = this.props;
        onLanguageUpdate(data.language).then(res => {
          if (res) {
            this.handleLanguageEditCancel();
          }
        });
      }
    });
  }
}
