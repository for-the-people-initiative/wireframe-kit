<template>
  <div class="tree" :class="additionalClasses" role="tree" :aria-multiselectable="selectionMode === 'multiple'">
    <div v-if="filter" class="tree__filter">
      <input
        v-model="filterValue"
        type="text"
        class="tree__filter-input"
        placeholder="Search..."
        @input="onFilterInput"
      />
    </div>
    <div class="tree__container">
      <TreeNode
        v-for="node in filteredNodes"
        :key="getNodeKey(node)"
        :node="node"
        :level="0"
        :selection-mode="selectionMode"
        :selected-keys="selectedKeysSet"
        :expanded-keys="expandedKeysInternal"
        :label-field="labelField"
        :key-field="keyField"
        :children-field="childrenField"
        @select="onNodeSelect"
        @toggle="onNodeToggle"
      />
      <div v-if="filteredNodes.length === 0" class="tree__empty">
        No results found
      </div>
    </div>
  </div>
</template>

<style src="./Tree.scss"></style>

<script setup lang="ts">
import type { TreeProps, TreeEmits } from '../../types';
import { computed, ref, watch, h } from "vue";

defineOptions({ name: 'FtpTree' });

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

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    };

    return () => {
      const children = [];

      // Node content
      const nodeContent = h("div", {
        class: [
          "tree__node",
          isSelected.value && "tree__node--selected"
        ],
        style: { paddingLeft: `${props.level * 24 + 8}px` },
        role: "treeitem",
        "aria-selected": isSelected.value,
        "aria-expanded": hasChildren.value ? isExpanded.value : undefined,
        tabindex: 0,
        onClick: onSelect,
        onKeydown: onKeydown,
      }, [
        hasChildren.value ? h("button", {
          type: "button",
          class: ["tree__toggler", isExpanded.value && "tree__toggler--expanded"],
          onClick: onToggle,
          "aria-label": isExpanded.value ? "Collapse" : "Expand",
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
        ]) : h("span", { class: "tree__toggler-spacer" }),
        props.selectionMode === "checkbox" || props.selectionMode === "multiple" ? h("span", {
          class: ["tree__checkbox", isSelected.value && "tree__checkbox--checked"]
        }, [
          isSelected.value ? h("svg", { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none" }, [
            h("path", {
              d: "M10 3L4.5 8.5L2 6",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round"
            })
          ]) : null
        ]) : null,
        h("span", { class: "tree__node-label" }, props.node[props.labelField])
      ]);

      children.push(nodeContent);

      // Children nodes
      if (hasChildren.value && isExpanded.value) {
        const nodeChildren = props.node[props.childrenField];
        children.push(h("div", { class: "tree__children", role: "group" },
          nodeChildren.map((child: any) =>
            h(TreeNode, {
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
            })
          )
        ));
      }

      return h("div", { class: "tree__node-wrapper" }, children);
    };
  }
};

const props = withDefaults(defineProps<TreeProps>(), {
  modelValue: null,
  nodes: () => [],
  expandedKeys: () => [],
  selectionMode: "single",
  filter: false,
  labelField: "label",
  keyField: "key",
  childrenField: "children",
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "update:expandedKeys", "node-select", "node-expand", "node-collapse", "filter"]);

const filterValue = ref("");
const expandedKeysInternal = ref(new Set(props.expandedKeys));

watch(() => props.expandedKeys, (newKeys) => {
  expandedKeysInternal.value = new Set(newKeys);
}, { deep: true });

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

const filterNodes = (nodes: any, searchTerm: any) => {
  const result: any[] = [];
  const search = searchTerm.toLowerCase();

  nodes.forEach((node: any) => {
    const label = String(node[props.labelField]).toLowerCase();
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

const filteredNodes = computed(() => {
  if (!filterValue.value) return props.nodes;
  return filterNodes(props.nodes, filterValue.value);
});

const onNodeSelect = (node: any) => {
  if (props.isDisabled || !props.selectionMode) return;

  const key = node[props.keyField];

  if (props.selectionMode === "single") {
    emit("update:modelValue", key);
    emit("node-select", { node, key });
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
    emit("node-select", { node, key, selectedKeys: newValue });
  }
};

const onNodeToggle = (node: any) => {
  const key = node[props.keyField];
  const newExpanded = new Set(expandedKeysInternal.value);

  if (newExpanded.has(key)) {
    newExpanded.delete(key);
    emit("node-collapse", { node, key });
  } else {
    newExpanded.add(key);
    emit("node-expand", { node, key });
  }

  expandedKeysInternal.value = newExpanded;
  emit("update:expandedKeys", Array.from(newExpanded));
};

const onFilterInput = () => {
  emit("filter", { value: filterValue.value });
};

const additionalClasses = computed(() =>
  [props.isDisabled && "tree--disabled"].filter(Boolean).join(" ")
);
</script>
