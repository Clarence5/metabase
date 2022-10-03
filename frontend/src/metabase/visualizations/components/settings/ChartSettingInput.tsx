import React, { useState, useRef } from "react";
import TippyPopoverWithTrigger from "metabase/components/PopoverWithTrigger/TippyPopoverWithTrigger";

import {
  ChartSettingInputBlurChange,
  SuggestionContainer,
  Suggestion,
} from "./ChartSettingInput.styled";

interface ChartSettingInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  keys?: string[];
}

const ChartSettingInput = ({
  value: initialValue,
  onChange,
  keys,
  ...props
}: ChartSettingInputProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [value, setValue] = useState(initialValue);
  const optionsListRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLElement>(null);

  const handleChange = (text: string) => {
    if (keys) {
      const match = text.match(/.*{{([^}]*)$/);

      if (match) {
        const suggestionFilter = match[1];

        setSuggestions(
          keys.filter(
            k => k.toLowerCase().indexOf(suggestionFilter.toLowerCase()) !== -1,
          ),
        );
      } else {
        setSuggestions([]);
      }
    }
    setValue(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const match = value.match(/.*{{([^}]*)$/);
    const partial = match[1];

    if (partial) {
      setValue(v => v.replace(partial, `${suggestion}}}`));
      setSuggestions([]);
    }
  };

  const handleListMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    if (optionsListRef.current?.contains(event.target as Node)) {
      event.preventDefault();
    }
  };

  console.log(suggestions);

  return (
    <TippyPopoverWithTrigger
      renderTrigger={({ onClick: handleShowPopover, closePopover }) => (
        <ChartSettingInputBlurChange
          {...props}
          data-testid={props.id}
          value={value}
          onClick={handleShowPopover}
          onFocus={handleShowPopover}
          onChange={e => handleChange(e.target.value)}
          onBlur={() => onChange(value)}
        />
      )}
      placement="bottom-start"
      reference={inputRef.current}
      popoverContent={({ closePopover }) => {
        if (suggestions.length === 0) {
          return null;
        }

        return (
          <SuggestionContainer
            ref={optionsListRef as any}
            onMouseDown={handleListMouseDown}
          >
            {suggestions.map(option => (
              <Suggestion
                key={option}
                onClick={() => {
                  handleSuggestionClick(option);
                }}
              >
                {option}
              </Suggestion>
            ))}
          </SuggestionContainer>
        );
      }}
    />
  );
};

export default ChartSettingInput;
