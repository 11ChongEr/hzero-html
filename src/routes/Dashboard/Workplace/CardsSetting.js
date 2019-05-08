/**
 * 工作台 卡片设置
 * 对布局中的卡片进行新增或删除操作
 * @date 2019-01-28
 * @author WY yang.wang06@hand-china.com
 * @copyright © HAND 2019
 */

import React from 'react';
import { Modal, Row, Col, Checkbox, Badge, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { forEach } from 'lodash';

import { DEBOUNCE_TIME } from 'utils/constants';
import intl from 'utils/intl';

import styles from './index.less';

const modalStyle = {
  minWidth: '120px',
};

/**
 * @ReactProps {!Function} onAddCard - 新增卡片
 * @ReactProps {!Function} removeCard - 删除卡片
 * @ReactProps {!Function} loadLayout - 加载布局 和 设置卡片 (在比对后发现 没有权限的卡片后调用)
 * @ReactProps {!Function} onCancel - 取消卡片设置状态
 * @ReactProps {!boolean} visible
 * @ReactProps {!object[]} catalogType - 卡片类型
 * @ReactProps {!object[]} roleCards - 当前拥有权限的卡片
 * @ReactProps {object[]} prevRoleCards - 之前拥有权限的卡片
 * @ReactProps {!object[]} layout - 布局中的卡片
 */
export default class CardsSetting extends React.Component {
  state = {
    editCards: {},
  };

  timer = {}; // 卡片 code 对应的 bounce

  componentDidUpdate(prevProps) {
    const { visible: prevVisible } = prevProps;
    const { visible, loadAssignableCards } = this.props;
    if (prevVisible === false && visible === true) {
      loadAssignableCards().then(res => {
        if (res) {
          // 由隐藏状态变为显示状态, 计算当前 卡片设置的 state
          const { prevRoleCards, roleCards, layout, catalogType } = this.props;

          const editCards = {};
          catalogType.forEach(catalog => {
            editCards[catalog.value] = {
              cards: [],
            };
          });
          roleCards.forEach(card => {
            const layoutCard = layout.find(insertCard => insertCard.i === card.code);
            const editCard = { ...card, ...layoutCard };
            editCard.isNew = prevRoleCards
              ? !prevRoleCards.some(prevCard => prevCard.code === card.code)
              : false;
            editCard.isInsert = !!layoutCard;
            if (editCards[editCard.catalogType]) {
              // 存在卡片类型中, 否则是错误的数据(或者脏数据)
              editCards[editCard.catalogType].cards.push(editCard);
            }
          });
          this.setState({
            editCards,
          });
        }
      });
    }
  }

  shouldComponentUpdate(nextProps) {
    const { visible } = nextProps;
    const { visible: prevVisible } = this.props;
    if (visible === true) {
      return true;
    } else if (visible === false && prevVisible === true) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    forEach(this.timer, timer => {
      clearTimeout(timer);
    });
  }

  render() {
    const { visible, onCancel, loading = false } = this.props;
    return (
      <Modal
        destroyOnClose
        title={intl.get('hpfm.card.view.title.cardsSetting').d('卡片设置')}
        style={modalStyle}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        className={styles['card-setting']}
        visible={visible}
        onCancel={onCancel}
        footer={null}
      >
        <Spin spinning={loading}>{this.renderCatalogTypeRow()}</Spin>
      </Modal>
    );
  }

  renderCatalogTypeRow() {
    const { catalogType } = this.props;
    const { editCards } = this.state;
    return catalogType.map(catalog => {
      const rowData = editCards[catalog.value];
      if (rowData && rowData.cards.length > 0) {
        return (
          <Row gutter={16} key={catalog.value} className={styles['card-row']}>
            <Col key="title" className={styles['card-col']}>
              <h3>{catalog.meaning}</h3>
            </Col>
            {this.renderCatalogTypeCols(catalog, rowData.cards)}
          </Row>
        );
      }
      return null;
    });
  }

  renderCatalogTypeCols(catalog, cards) {
    return cards.map(card => {
      return (
        <Col key={card.code} className={styles['card-col']}>
          <Checkbox
            key="is-insert"
            onClick={this.handleCardInsertChange.bind(this, card, catalog)}
            checked={card.isInsert}
          >
            {card.name}
          </Checkbox>
          {card.isNew && <Badge key="is-new" dot />}
        </Col>
      );
    });
  }

  /**
   * 卡片是否选中状态改变
   */
  handleCardInsertChange(card, catalog, e) {
    const { editCards } = this.state;
    const { cards } = editCards[catalog.value];
    const newCards = cards.map(record => {
      if (record.code === card.code) {
        return {
          ...record,
          isInsert: e.target.checked,
        };
      } else {
        return record;
      }
    });
    this.setState({
      editCards: {
        ...editCards,
        [catalog.value]: {
          cards: newCards,
        },
      },
    });
    this.changeCard(card, e.target.checked);
  }

  changeCard(card, isInsert) {
    if (this.timer[card.code]) {
      console.log(`clear timer: card-${card.code}, timer-${this.timer[card.code]}`);
      clearTimeout(this.timer[card.code]);
    }
    this.timer[card.code] = setTimeout(() => {
      this.realChangeCard(card, isInsert);
    }, DEBOUNCE_TIME);
  }

  @Bind()
  realChangeCard(card, isInsert) {
    const { onAddCard, onRemoveCard } = this.props;
    if (isInsert) {
      onAddCard(card);
    } else {
      onRemoveCard(card.code);
    }
  }
}
