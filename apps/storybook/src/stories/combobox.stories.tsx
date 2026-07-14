import type { Meta, StoryObj } from '@storybook/react-vite'
import { Combobox } from '@woon-ui/combobox'
import { useMemo, useState } from 'react'

const meta = {
  title: 'Components/Combobox',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const FRUITS = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'cherry', label: '체리' },
  { value: 'grape', label: '포도' },
  { value: 'kiwi', label: '키위' },
  { value: 'mango', label: '망고' },
  { value: 'orange', label: '오렌지' },
  { value: 'peach', label: '복숭아' },
]

function AutocompleteStory() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => FRUITS.filter((fruit) => fruit.label.includes(query) || fruit.value.includes(query)),
    [query],
  )

  return (
    <div className="woon-story">
      <Combobox.Root
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Combobox.Input placeholder="과일 검색..." />
        <Combobox.Content>
          {filtered.map((fruit) => (
            <Combobox.Item key={fruit.value} value={fruit.value}>
              {fruit.label}
            </Combobox.Item>
          ))}
          {filtered.length === 0 && <Combobox.Empty>결과 없음</Combobox.Empty>}
        </Combobox.Content>
      </Combobox.Root>
      <p className="woon-story-result">
        선택된 값: {value || '없음'} / 입력: {query || '없음'}
      </p>
    </div>
  )
}

function FreeFormStory() {
  const [value, setValue] = useState('')
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => FRUITS.filter((fruit) => fruit.label.includes(query) || fruit.value.includes(query)),
    [query],
  )

  return (
    <div className="woon-story">
      <Combobox.Root
        freeForm
        value={value}
        onValueChange={setValue}
        inputValue={query}
        onInputValueChange={setQuery}
      >
        <Combobox.Input placeholder="직접 입력하거나 선택..." />
        <Combobox.Content>
          {filtered.map((fruit) => (
            <Combobox.Item key={fruit.value} value={fruit.value}>
              {fruit.label}
            </Combobox.Item>
          ))}
          {filtered.length === 0 && <Combobox.Empty>결과 없음</Combobox.Empty>}
        </Combobox.Content>
      </Combobox.Root>
      <p className="woon-story-result">
        value: {value || '없음'} / inputValue: {query || '없음'}
      </p>
    </div>
  )
}

export const Autocomplete: Story = {
  render: () => <AutocompleteStory />,
}

export const FreeForm: Story = {
  render: () => <FreeFormStory />,
}
