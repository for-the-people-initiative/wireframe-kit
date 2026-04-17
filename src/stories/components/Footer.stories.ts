import type { Meta, StoryObj } from '@storybook/vue3';
import Footer from '../../components/Footer/Footer.vue';

const meta = {
  title: 'Components/Footer',
  component: Footer,
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    copyright: '© 2025 Wireframe Design System. All rights reserved.',
    columns: [
      { title: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'Changelog', href: '#' }] },
      { title: 'Resources', links: [{ label: 'Documentation', href: '#' }, { label: 'Guides', href: '#' }, { label: 'API Reference', href: '#' }] },
      { title: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Careers', href: '#' }] },
    ],
    socialLinks: [
      { label: 'GitHub', href: '#', icon: 'pi pi-github' },
      { label: 'Twitter', href: '#', icon: 'pi pi-twitter' },
    ],
  },
};
