<template>
  <div
    ref="containerRef"
    class="tree-select"
    :class="additionalClasses"
  >
    <div
      v-rough="{ severity: 2 }"
      class="tree-select__trigger"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-disabled="isDisabled"
      :tabindex="isDisabled ? -1 : 0"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <div class="tree-select__content">
        <span v-if="!displayLabel" class="tree-select__placeholder">{{ placeholder }}</span>
        <span v-else class="tree-select__label">{{ displayLabel }}</span>
      </div>
      <span class="tree-select__icon" :class="{ 'tree-select__icon--open': isOpen }">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        v-rough
        ref="dropdownRef"
        class="tree-select__dropdown"
        :style="dropdownStyle"
      >
        <div v-if="filter" class="tree-select__filter">
          <input
            ref="filterInputRef"
            v-model="filterValue"
            type="text"
            class="tree-select__filter-input"
            placeholder="Search..."
            @keydown.stop
          />
        </div>
        <div class="tree-select__tree" role="tree">
          <TreeNode
            v-for="node in filteredOptions"
            :key="getNodeKey(node)"
            :node="node"
            :level="0"
            :selection-mode="selectionMode"
            :selected-keys="selectedKeysSet"
            :expanded-keys="expandedKeys"
            :label-field="labelField"
            :key-field="keyField"
            :children-field="childrenField"
            @select="onNodeSelect"
            @toggle="onNodeToggle"
          />
          <div v-if="filteredOptions.length === 0" class="tree-select__empty">
            No results found
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./TreeSelect.scss"></style>

<script setup lang="ts">
import type { TreeSelectProps, TreeSelectEmits } from '../../types';
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick, h } from "vue";

defineOptions({ name: 'TreeSelect' });

// TreeNode subcomponent
const TreeNode = {
  name: "TreeNode",
  props: {
    node: Object,
    level: Number,
    selectionMode: String,
    selectedKeys: Set,
    expandedKeys: Set,
    labelField: String,
    keyField: String,
    childrenField: String,
  },
  emits: ["select", "toggle"],
  setup(props: any, { emit }: { emit: any }) {
    const hasChildren = computed(() => {
      const children = props.node[props.childrenField];
      return children && children.length > 0;
    });

    const isExpanded = computed(() => {
      return props.expandedKeys.has(props.node[props.keyField]);
    });

    const isSelected = computed(() => {
      return props.selectedKeys.has(props.node[props.keyField]);
    });

    const onToggle = (event: Event) => {
      event.stopPropagation();
      emit("toggle", props.node);
    };

    const onSelect = () => {
      emit("select", props.node);
    };

    return () => {
      const children = [];

      // Node content
      const nodeContent = h("div", {
        class: [
          "tree-select__node",
          isSelected.value && "tree-select__node--selected"
        ],
        style: { paddingLeft: `${props.level * 24 + 12}px` },
        onClick: onSelect,
      }, [
        hasChildren.value ? h("button", {
          type: "button",
          class: ["tree-select__toggler", isExpanded.value && "tree-select__toggler--expanded"],
          onClick: onToggle,
        }, [
          h("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none" }, [
            h("path", {
              d: "M6 4L10 8L6 12",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            })
          ])
        ]) : h("span", { class: "tree-select__toggler-spacer" }),
        props.selectionMode === "checkbox" ? h("span", {
          class: ["tree-select__checkbox", isSelected.value && "tree-select__checkbox--checked"]
        }, [
          isSelected.value ? h("svg", { viewBox: "0 0 12 12", fill: "none" }, [
            h("path", {
              d: "M10 3L4.5 8.5L2 6",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            })
          ]) : null
        ]) : null,
        h("span", { class: "tree-select__node-label" }, props.node[props.labelField])
      ]);

      children.push(nodeContent);

      // Children nodes
      if (hasChildren.value && isExpanded.value) {
        const nodeChildren = props.node[props.childrenField];
        nodeChildren.forEach((child: any) => {
          children.push(h(TreeNode, {
            key: child[props.keyField],
            node: child,
            level: props.level + 1,
            selectionMode: props.selectionMode,
            selectedKeys: props.selectedKeys,
            expandedKeys: props.expandedKeys,
            labelField: props.labelField,
            keyField: props.keyField,
            childrenField: props.childrenField,
            onSelect: (n: any) => emit("select", n),
            onToggle: (n: any) => emit("toggle", n),
          }));
        });
      }

      return h("div", { class: "tree-select__node-wrapper" }, children);
    };
  }
};

const props = withDefaults(defineProps<TreeSelectProps>(), {
  modelValue: null,
  options: () => [],
  selectionMode: "single",
  placeholder: "Select...",
  filter: false,
  labelField: "label",
  keyField: "key",
  childrenField: "children",
  size: "md",
  isDisabled: false,
  isInvalid: false,
});

const emit = defineEmits(["update:modelValue", "change"]);

const containerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const filterInputRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const filterValue = ref("");
const expandedKeys = ref(new Set());
const dropdownStyle = ref({});

const getNodeKey = (node: any) => node[props.keyField];

const selectedKeysSet = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return new Set();
  }
  if (Array.isArray(props.modelValue)) {
    return new Set(props.modelValue);
  }
  return new Set([props.modelValue]);
});

const flattenNodes = (nodes: any, result: any[] = []) => {
  nodes.forEach((node: any) => {
    result.push(node);
    const children = node[props.childrenField];
    if (children && children.length > 0) {
      flattenNodes(children, result);
    }
  });
  return result;
};

const findNodeByKey = (key: any) => {
  const allNodes = flattenNodes(props.options);
  return allNodes.find((node) => node[props.keyField] === key);
};

const displayLabel = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return "";
  }
  if (Array.isArray(props.modelValue)) {
    if (props.modelValue.length === 0) return "";
    return props.modelValue.map((key) => {
      const node = findNodeByKey(key);
      return node ? node[props.labelField] : key;
    }).join(", ");
  }
  const node = findNodeByKey(props.modelValue);
  return node ? node[props.labelField] : "";
});

const filterNodes = (nodes: any, searchTerm: any) => {
  const result: any[] = [];
  const search = searchTerm.toLowerCase();

  nodes.forEach((node: any) => {
    const label = node[props.labelField].toLowerCase();
    const children = node[props.childrenField];

    if (label.includes(search)) {
      result.push(node);
    } else if (children && children.length > 0) {
      const filteredChildren = filterNodes(children, searchTerm);
      if (filteredChildren.length > 0) {
        result.push({
          ...node,
          [props.childrenField]: filteredChildren,
        });
      }
    }
  });

  return result;
};

const filteredOptions = computed(() => {
  if (!filterValue.value) return props.options;
  return filterNodes(props.options, filterValue.value);
});

const onNodeSelect = (node: any) => {
  const key = node[props.keyField];

  if (props.selectionMode === "single") {
    emit("update:modelValue", key);
    emit("change", { value: key, node });
    close();
  } else {
    let newValue;
    if (selectedKeysSet.value.has(key)) {
      newValue = Array.isArray(props.modelValue)
        ? props.modelValue.filter((k) => k !== key)
        : [];
    } else {
      newValue = Array.isArray(props.modelValue)
        ? [...props.modelValue, key]
        : [key];
    }
    emit("update:modelValue", newValue);
    emit("change", { value: newValue });
  }
};

const onNodeToggle = (node: any) => {
  const key = node[props.keyField];
  const newExpanded = new Set(expandedKeys.value);
  if (newExpanded.has(key)) {
    newExpanded.delete(key);
  } else {
    newExpanded.add(key);
  }
  expandedKeys.value = newExpanded;
};

const toggle = () => {
  if (props.isDisabled) return;
  isOpen.value = !isOpen.value;
};

const open = () => {
  if (props.isDisabled || isOpen.value) return;
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
  filterValue.value = "";
};

const updateDropdownPosition = () => {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  dropdownStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 1000,
  };
};

const onTriggerKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
    case " ":
      event.preventDefault();
      toggle();
      break;
    case "ArrowDown":
      event.preventDefault();
      open();
      break;
    case "Escape":
      close();
      break;
  }
};

const onClickOutside = (event: MouseEvent) => {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    close();
  }
};

watch(isOpen, async (newValue) => {
  if (newValue) {
    updateDropdownPosition();
    await nextTick();
    if (props.filter && filterInputRef.value) {
      filterInputRef.value.focus();
    }
  }
});

onMounted(() => {
  document.addEventListener("click", onClickOutside);
  window.addEventListener("resize", updateDropdownPosition);
  window.addEventListener("scroll", updateDropdownPosition, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
  window.removeEventListener("resize", updateDropdownPosition);
  window.removeEventListener("scroll", updateDropdownPosition, true);
});

const additionalClasses = computed(() =>
  [
    `tree-select--size-${props.size}`,
    props.isDisabled && "tree-select--disabled",
    props.isInvalid && "tree-select--invalid",
    isOpen.value && "tree-select--open",
  ]
    .filter(Boolean)
    .join(" ")
);
</script>
