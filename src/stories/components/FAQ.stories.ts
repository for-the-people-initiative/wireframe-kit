import type { Meta, StoryObj } from '@storybook/vue3';
import FAQ from '../../components/FAQ/FAQ.vue';

const meta = {
  title: 'Components/FAQ',
  component: FAQ,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'separated', 'bordered'] },
  },
} satisfies Meta<typeof FAQ>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { question: 'What is the Wireframe Design System?', answer: 'A Vue 3 component library with a hand-drawn aesthetic built on Rough.js — designed for rapid wireframing and low-fidelity prototyping.' },
  { question: 'Is it free to use?', answer: 'Yes! The design system is open source and free for personal and commercial projects.' },
  { question: 'Does it support dark mode?', answer: 'Dark mode is the default theme, with full support for custom theming via CSS custom properties and design tokens.' },
  { question: 'Can I customize the components?', answer: 'Absolutely. Every component uses design tokens that can be overridden to match your brand.' },
];

export const Default: Story = { args: { items, variant: 'default' } };
export const Separated: Story = { args: { items, variant: 'separated' } };
export const Bordered: Story = { args: { items, variant: 'bordered' } };
