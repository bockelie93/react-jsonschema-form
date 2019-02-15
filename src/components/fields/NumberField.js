import React from "react";

import * as types from "../../types";
import { asNumber } from "../../utils";

/**
 * The NumberField class has some special handling for dealing with trailing
 * decimal points and/or zeroes. This logic is designed to allow trailing values
 * to be visible in the input element, but not be represented in the
 * corresponding form data.
 *
 * The algorithm is as follows:
 *
 * 1. When the input value changes the value is cached in the component state
 *
 * 2. The value is then normalized, removing trailing decimal points and zeros,
 *    then passed to the "onChange" callback
 *
 * 3. When the component is rendered, the formData value is checked against the
 *    value cached in the state. If it matches the cached value, the cached
 *    value is passed to the input instead of the formData value
 */
class NumberField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lastValue: props.value,
    };
  }

  handleChange = value => {
    // Cache the original value in component state
    this.setState({ lastValue: value });

    // Check that the value is a string (this can happen if the widget used is a
    // <select>, due to an enum declaration etc) then, if the value ends in a
    // trail decimal point or multiple zeroes, strip the trailing values
    let normalized =
      typeof value === "string" && value.match(/[0.]+$/)
        ? asNumber(value.replace(/[0.]+$/, ""))
        : asNumber(value);

    this.props.onChange(normalized);
  };

  render() {
    const { StringField } = this.props.registry.fields;
    const { formData, ...props } = this.props;
    const { lastValue } = this.state;

    let value = formData;

    if (typeof lastValue === "string" && value) {
      // Construct a regular expression that checks for a string that consists
      // of the formData value suffixed with zero or one '.' characters and zero
      // or more '0' characters
      const re = new RegExp(`${value}`.replace(".", "\\.") + "\\.?0*$");

      // If the cached "lastValue" is a match, use that instead of the formData
      // value to prevent the input value from changing in the UI
      if (lastValue.match(re)) {
        value = lastValue;
      }
    }

    return (
      <StringField {...props} formData={value} onChange={this.handleChange} />
    );
  }
}

if (process.env.NODE_ENV !== "production") {
  NumberField.propTypes = types.fieldProps;
}

NumberField.defaultProps = {
  uiSchema: {},
};

export default NumberField;
