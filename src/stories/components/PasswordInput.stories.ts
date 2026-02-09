import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import PasswordInput from '../../components/PasswordInput/PasswordInput.vue';

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  argTypes: {
    modelValue: { control: 'text' },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    minLength: { control: 'number' },
    showStrength: { control: 'boolean' },
    showCriteria: { control: 'boolean' },
    requireStrength: { control: 'select', options: ['none', 'weak', 'fair', 'strong'] },
    errorMessage: { control: 'text' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  },
  args: {
    placeholder: 'Enter password',
    size: 'md',
    showStrength: true,
    showCriteria: false,
    minLength: 6,
    requireStrength: 'none',
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic usage
export const Default: Story = {};

// With label
export const WithLabel: Story = {
  args: {
    label: 'Password',
  },
};

// With criteria checklist
export const WithCriteria: Story = {
  args: {
    label: 'Create Password',
    showCriteria: true,
  },
};

// Without strength indicator
export const NoStrength: Story = {
  args: {
    showStrength: false,
    placeholder: 'Simple password field',
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    isDisabled: true,
    placeholder: 'Disabled',
  },
};

// Invalid state
export const Invalid: Story = {
  args: {
    isInvalid: true,
    placeholder: 'Invalid password',
  },
};

// Different sizes
export const AllSizes: Story = {
  render: () => ({
    components: { PasswordInput },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px; max-width: 400px;">
        <PasswordInput size="sm" placeholder="Small" label="Small" />
        <PasswordInput size="md" placeholder="Medium" label="Medium" />
        <PasswordInput size="lg" placeholder="Large" label="Large" />
      </div>
    `,
  }),
};

// With password confirmation
export const WithConfirmation: Story = {
  render: () => ({
    components: { PasswordInput },
    setup() {
      const password = ref('');
      const confirmPassword = ref('');
      return { password, confirmPassword };
    },
    template: `
      <div style="max-width: 400px;">
        <PasswordInput
          v-model="password"
          :confirm-value="confirmPassword"
          label="Create Password"
          placeholder="Enter password"
          confirm-placeholder="Confirm password"
          show-criteria
          @update:confirm-value="confirmPassword = $event"
        />
        <p style="margin-top: 16px; font-size: 14px; color: #666;">
          Password: {{ password || '(empty)' }}<br>
          Confirm: {{ confirmPassword || '(empty)' }}
        </p>
      </div>
    `,
  }),
};

// Require strong password
export const RequireStrong: Story = {
  render: () => ({
    components: { PasswordInput },
    setup() {
      const password = ref('');
      const isValid = ref(false);
      return { password, isValid };
    },
    template: `
      <div style="max-width: 400px;">
        <PasswordInput
          v-model="password"
          label="Create Password"
          require-strength="strong"
          show-criteria
          @valid="isValid = $event"
        />
        <p style="margin-top: 16px; padding: 12px; border-radius: 8px; font-size: 14px;"
           :style="{ background: isValid ? '#d4edda' : '#f8f9fa' }">
          <strong>Form valid:</strong> {{ isValid ? '✅ Yes' : '❌ No' }}
        </p>
      </div>
    `,
  }),
};

// With custom error message
export const CustomErrorMessage: Story = {
  args: {
    label: 'Password',
    requireStrength: 'fair',
    errorMessage: 'Please choose a stronger password for better security',
    showCriteria: true,
  },
};

// Form integration example
export const FormIntegration: Story = {
  render: () => ({
    components: { PasswordInput },
    setup() {
      const password = ref('');
      const confirmPassword = ref('');
      const isValid = ref(false);
      const submitted = ref(false);
      
      const handleSubmit = () => {
        submitted.value = true;
        if (isValid.value) {
          alert('Form submitted successfully!');
        }
      };
      
      return { password, confirmPassword, isValid, submitted, handleSubmit };
    },
    template: `
      <form @submit.prevent="handleSubmit" style="max-width: 400px;">
        <PasswordInput
          v-model="password"
          :confirm-value="confirmPassword"
          label="Create Password"
          require-strength="strong"
          show-strength
          show-criteria
          @update:confirm-value="confirmPassword = $event"
          @valid="isValid = $event"
        />
        <button 
          type="submit" 
          :disabled="!isValid"
          style="margin-top: 16px; padding: 10px 20px; background: #f97316; color: white; border: none; border-radius: 6px; cursor: pointer; opacity: ${isValid ? 1 : 0.5};"
          :style="{ opacity: isValid ? 1 : 0.5, cursor: isValid ? 'pointer' : 'not-allowed' }"
        >
          Create Account
        </button>
        <p v-if="submitted && !isValid" style="color: #dc2626; font-size: 14px; margin-top: 8px;">
          Please meet all password requirements
        </p>
      </form>
    `,
  }),
};

// Full featured example
export const FullFeatured: Story = {
  render: () => ({
    components: { PasswordInput },
    setup() {
      const password = ref('');
      const confirmPassword = ref('');
      const strength = ref('');
      const isValid = ref(false);
      const onStrengthChange = (level: string) => {
        strength.value = level;
      };
      return { password, confirmPassword, strength, isValid, onStrengthChange };
    },
    template: `
      <div style="max-width: 400px;">
        <PasswordInput
          v-model="password"
          :confirm-value="confirmPassword"
          label="Create a secure password"
          placeholder="Enter your password"
          confirm-placeholder="Re-enter your password"
          show-strength
          show-criteria
          require-strength="strong"
          :min-length="8"
          @update:confirm-value="confirmPassword = $event"
          @strength-change="onStrengthChange"
          @valid="isValid = $event"
        />
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 14px;">
          <p><strong>Current strength:</strong> {{ strength || 'N/A' }}</p>
          <p><strong>Valid:</strong> {{ isValid ? '✅' : '❌' }}</p>
        </div>
      </div>
    `,
  }),
};

// Interactive playground
export const Playground: Story = {
  render: (args) => ({
    components: { PasswordInput },
    setup() {
      const password = ref('');
      return { password, args };
    },
    template: `
      <div style="max-width: 400px;">
        <PasswordInput
          v-model="password"
          v-bind="args"
        />
      </div>
    `,
  }),
};
