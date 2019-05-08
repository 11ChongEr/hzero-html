/**
 * @date 2019-03-08
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';
import { isFunction, isBoolean } from 'lodash';
import { Bind } from 'lodash-decorators';

class LazyLoadMenuIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHover: false,
      base: '', // 标准的 svg
      hover: '', // 鼠标移上的 svg
    };
  }

  componentDidMount() {
    this.loadIcon();
  }

  componentDidUpdate(prevProps) {
    const { code: prevCode } = prevProps;
    const { code: nextCode } = this.props;
    if (prevCode !== nextCode) {
      this.loadIcon();
    }
  }

  loadIcon() {
    const { code } = this.props;
    if (code) {
      Promise.all([
        import(`../../assets/menu/${code}.svg`),
        import(`../../assets/menu/${code}-s.svg`),
      ])
        .then(([base, hover]) => {
          this.setState({
            base: base.default || base,
            hover: hover.default || hover,
          });
        })
        .catch(() => {
          this.setState({
            base: '',
            hover: '',
          });
          // FIXME: 如果没有这个icon 怎么办
        });
    }
  }

  @Bind()
  handleMouseEnter(e) {
    const { onMouseEnter } = this.props;
    this.setState({ isHover: true });
    if (isFunction(onMouseEnter)) {
      onMouseEnter(e);
    }
  }

  @Bind()
  handleMouseLeave(e) {
    const { onMouseLeave } = this.props;
    this.setState({ isHover: false });
    if (isFunction(onMouseLeave)) {
      onMouseLeave(e);
    }
  }

  render() {
    const { isHover: controlIsHover, alt = '', code, placeholder, ...otherProps } = this.props;
    const { base, hover, isHover } = this.state;
    if (isBoolean(controlIsHover)) {
      if (controlIsHover && hover) {
        return (
          <img
            src={hover}
            alt={alt}
            {...otherProps}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          />
        );
      }
      if (base) {
        return (
          <img
            src={base}
            alt={alt}
            {...otherProps}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
          />
        );
      }
      return <span {...otherProps}>{placeholder}</span>;
    }
    if (isHover && hover) {
      return (
        <img
          src={hover}
          alt={alt}
          {...otherProps}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        />
      );
    }
    if (base) {
      return (
        <img
          src={base}
          alt={alt}
          {...otherProps}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        />
      );
    }
    return <span {...otherProps}>{placeholder}</span>;
  }
}

export default LazyLoadMenuIcon;
