<template>
  <div v-rough class="treetable" :class="additionalClasses">
    <table class="treetable__table" role="treegrid">
      <thead class="treetable__head">
        <tr class="treetable__row treetable__row--header">
          <th
            v-for="col in columns"
            :key="col.field"
            class="treetable__cell treetable__cell--header"
            :style="col.style"
          >
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody class="treetable__body">
        <TreeTableRow
          v-for="node in filteredNodes"
          :key="getNodeKey(node)"
          :node="node"
          :level="0"
          :columns="columns"
          :selection-mode="selectionMode"
          :selected-keys="selectedKeysSet"
          :expanded-keys="expandedKeysInternal"
          :key-field="keyField"
          :children-field="childrenField"
          :striped="striped"
          @select="onNodeSelect"
          @toggle="onNodeToggle"
        />
        <tr v-if="filteredNodes.length === 0">
          <td :colspan="columns.length" class="treetable__empty">
            No records found
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style src="./TreeTable.scss"></style>

<script setup lang="ts">
import type { TreeTableProps, TreeTableEmits } from '../../types';
import { computed, ref, watch, h } from "vue";

defineOptions({ name: 'FtpTreeTable' });

// TreeTableRow subcomponent
const TreeTableRow = {
  name: "TreeTableRow",
  props: {
    node: Object,
    level: Number,
    columns: Array,
    selectionMode: String,
    selectedKeys: Set,
    expandedKeys: Set,
    keyField: String,
    childrenField: String,
    striped: Boolean,
    rowIndex: Number,
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
      const rows = [];

      // Main row
      const cells = props.columns.map((col: any, colIndex: any) => {
        const cellContent = [];

        // First column gets toggle and checkbox
        if (colIndex === 0) {
          // Indent spacer
          if (props.level > 0) {
            cellContent.push(h("span", {
              class: "treetable__indent",
              style: { width: `${props.level * 24}px` }
            }));
          }

          // Toggle button
          if (hasChildren.value) {
            cellContent.push(h("button", {
              type: "button",
              class: ["treetable__toggler", isExpanded.value && "treetable__toggler--expanded"],
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
            ]));
          } else {
            cellContent.push(h("span", { class: "treetable__toggler-spacer" }));
          }

          // Checkbox for selection
          if (props.selectionMode === "checkbox" || props.selectionMode === "multiple") {
            cellContent.push(h("span", {
              class: ["treetable__checkbox", isSelected.value && "treetable__checkbox--checked"]
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
            ]));
          }
        }

        // Cell content
        cellContent.push(h("span", { class: "treetable__cell-content" }, props.node[col.field]));

        return h("td", {
          class: "treetable__cell",
          style: col.style,
        }, cellContent);
      });

      const row = h("tr", {
        class: [
          "treetable__row",
          isSelected.value && "treetable__row--selected"
        ],
        role: "row",
        "aria-selected": isSelected.value,
        "aria-expanded": hasChildren.value ? isExpanded.value : undefined,
        "aria-level": props.level + 1,
        tabindex: 0,
        onClick: onSelect,
        onKeydown: onKeydown,
      }, cells);

      rows.push(row);

      // Children rows
      if (hasChildren.value && isExpanded.value) {
        const nodeChildren = props.node[props.childrenField];
        nodeChildren.forEach((child: any, index: any) => {
          rows.push(h(TreeTableRow, {
            key: child[props.keyField],
            node: child,
            level: props.level + 1,
            columns: props.columns,
            selectionMode: props.selectionMode,
            selectedKeys: props.selectedKeys,
            expandedKeys: props.expandedKeys,
            keyField: props.keyField,
            childrenField: props.childrenField,
            striped: props.striped,
            rowIndex: index,
            onSelect: (n: any) => emit("select", n),
            onToggle: (n: any) => emit("toggle", n),
          }));
        });
      }

      return rows;
    };
  }
};

const props = withDefaults(defineProps<TreeTableProps>(), {
  modelValue: null,
  nodes: () => [],
  columns: () => [],
  expandedKeys: () => [],
  selectionMode: null,
  keyField: "key",
  childrenField: "children",
  striped: false,
  isDisabled: false,
});

const emit = defineEmits(["update:modelValue", "update:expandedKeys", "node-select", "node-expand", "node-collapse"]);

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

const filteredNodes = computed(() => props.nodes);

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

const additionalClasses = computed(() =>
  [
    props.isDisabled && "treetable--disabled",
    props.striped && "treetable--striped",
  ].filter(Boolean).join(" ")
);
</script>
