<template>
  <div class="organization-chart">
    <OrganizationChartNode
      v-if="value"
      :node="value"
      :selection-mode="selectionMode"
      :selected-keys="selectedKeys"
      :expanded-keys="internalExpandedKeys"
      @node-select="onNodeSelect"
      @node-toggle="onNodeToggle"
    >
      <template #default="{ node }">
        <slot :node="node">
          <div class="organization-chart__node-content">
            <div v-if="node.label" class="organization-chart__node-title">
              {{ node.label }}
            </div>
            <div v-if="node.type" class="organization-chart__node-subtitle">
              {{ node.type }}
            </div>
          </div>
        </slot>
      </template>
    </OrganizationChartNode>
  </div>
</template>

<style src="./OrganizationChart.scss"></style>

<script setup lang="ts">
import type { OrganizationChartProps, OrganizationChartEmits } from '../../types';
import { ref, watch, h, defineComponent } from "vue";

const props = withDefaults(defineProps<OrganizationChartProps>(), {
  value: null,
  selectionMode: undefined,
  selectedKeys: () => ({}),
  expandedKeys: () => ({}),
  collapsible: false,
});

const emit = defineEmits([
  "update:selectedKeys",
  "update:expandedKeys",
  "node-select",
  "node-unselect",
  "node-expand",
  "node-collapse",
]);

defineOptions({
  name: "FtpOrganizationChart",
});

const internalExpandedKeys = ref({ ...props.expandedKeys });

watch(
  () => props.expandedKeys,
  (val) => {
    internalExpandedKeys.value = { ...val };
  },
  { deep: true }
);

const onNodeSelect = (event: any) => {
  const { node, selected } = event;
  const key = node.key || node.label;
  const newSelectedKeys = { ...props.selectedKeys };

  if (props.selectionMode === "single") {
    Object.keys(newSelectedKeys).forEach((k) => delete newSelectedKeys[k]);
  }

  if (selected) {
    newSelectedKeys[key] = true;
    emit("node-select", { node });
  } else {
    delete newSelectedKeys[key];
    emit("node-unselect", { node });
  }

  emit("update:selectedKeys", newSelectedKeys);
};

const onNodeToggle = (event: any) => {
  const { node, expanded } = event;
  const key = node.key || node.label;
  const newExpandedKeys = { ...internalExpandedKeys.value };

  if (expanded) {
    newExpandedKeys[key] = true;
    emit("node-expand", { node });
  } else {
    delete newExpandedKeys[key];
    emit("node-collapse", { node });
  }

  internalExpandedKeys.value = newExpandedKeys;
  emit("update:expandedKeys", newExpandedKeys);
};

// Internal recursive node component
const OrganizationChartNode = defineComponent({
  name: "OrganizationChartNode",
  props: {
    node: Object,
    selectionMode: String,
    selectedKeys: Object,
    expandedKeys: Object,
  },
  emits: ["node-select", "node-toggle"],
  setup(nodeProps, { emit: nodeEmit, slots }) {
    const hasChildren = () =>
      nodeProps.node!.children && nodeProps.node!.children.length > 0;

    const isExpanded = () => {
      const key = nodeProps.node!.key || nodeProps.node!.label;
      return nodeProps.expandedKeys![key] !== false;
    };

    const isSelected = () => {
      const key = nodeProps.node!.key || nodeProps.node!.label;
      return !!nodeProps.selectedKeys![key];
    };

    const onNodeClick = () => {
      if (nodeProps.selectionMode) {
        nodeEmit("node-select", {
          node: nodeProps.node!,
          selected: !isSelected(),
        });
      }
    };

    const onToggleClick = (e: MouseEvent) => {
      e.stopPropagation();
      nodeEmit("node-toggle", {
        node: nodeProps.node!,
        expanded: !isExpanded(),
      });
    };

    return () => {
      const nodeClasses = [
        "organization-chart__node-wrapper",
        isSelected() && "organization-chart__node-wrapper--selected",
      ]
        .filter(Boolean)
        .join(" ");

      const nodeBox = h(
        "div",
        {
          class: [
            "organization-chart__node",
            isSelected() && "organization-chart__node--selected",
            nodeProps.selectionMode && "organization-chart__node--selectable",
          ]
            .filter(Boolean)
            .join(" "),
          onClick: onNodeClick,
        },
        [
          slots.default
            ? slots.default({ node: nodeProps.node! })
            : h("span", nodeProps.node!.label),
        ]
      );

      const toggleButton =
        hasChildren() &&
        h(
          "button",
          {
            class: "organization-chart__toggle",
            onClick: onToggleClick,
            "aria-label": isExpanded() ? "Collapse" : "Expand",
          },
          [
            h(
              "svg",
              {
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
              },
              [
                h("polyline", {
                  points: isExpanded() ? "18 15 12 9 6 15" : "6 9 12 15 18 9",
                }),
              ]
            ),
          ]
        );

      const children =
        hasChildren() &&
        isExpanded() &&
        h(
          "div",
          { class: "organization-chart__children" },
          nodeProps.node!.children.map((child: any, index: any) =>
            h(OrganizationChartNode, {
              key: child.key || index,
              node: child,
              selectionMode: nodeProps.selectionMode,
              selectedKeys: nodeProps.selectedKeys!,
              expandedKeys: nodeProps.expandedKeys!,
              "onNode-select": (e) => nodeEmit("node-select", e),
              "onNode-toggle": (e) => nodeEmit("node-toggle", e),
            })
          )
        );

      return h("div", { class: nodeClasses }, [nodeBox, toggleButton, children]);
    };
  },
});
</script>
