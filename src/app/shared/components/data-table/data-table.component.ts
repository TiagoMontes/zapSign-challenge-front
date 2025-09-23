import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

export interface DataTableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions';
  renderer?: (value: any, row: any) => string;
}

export interface DataTableAction {
  label: string;
  icon?: string;
  action: (row: any) => void;
  disabled?: (row: any) => boolean;
  color?: 'primary' | 'secondary' | 'danger';
}

export interface SortEvent {
  column: string;
  direction: 'asc' | 'desc' | null;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './data-table.component.html',
  styles: [],
})
export class DataTableComponent implements OnInit {
  @Input() columns: DataTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() actions: DataTableAction[] = [];
  @Input() selectable = false;
  @Input() emptyMessage = 'No data available';
  @Input() responsive = true;

  @Output() sort = new EventEmitter<SortEvent>();
  @Output() select = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' | null = null;
  selectedRows: any[] = [];
  allSelected = false;

  ngOnInit() {
    // Initialize component
  }

  onSort(column: DataTableColumn) {
    if (!column.sortable) return;

    if (this.sortColumn === column.key) {
      // Toggle direction
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = null;
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }

    this.sort.emit({
      column: this.sortColumn || '',
      direction: this.sortDirection,
    });
  }

  onSelectAll() {
    this.allSelected = !this.allSelected;
    if (this.allSelected) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.select.emit(this.selectedRows);
  }

  onSelectRow(row: any) {
    const index = this.selectedRows.findIndex((selected) => selected === row);
    if (index > -1) {
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRows.push(row);
    }
    this.allSelected = this.selectedRows.length === this.data.length;
    this.select.emit(this.selectedRows);
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  getCellValue(row: any, column: DataTableColumn): string {
    const value = this.getNestedValue(row, column.key);

    if (column.renderer) {
      return column.renderer(value, row);
    }

    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString();
    }

    return value?.toString() || '-';
  }

  private getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => o?.[k], obj);
  }

  getSortIconClasses(column: DataTableColumn): string {
    if (!column.sortable) return 'text-transparent';

    if (this.sortColumn === column.key) {
      return this.sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600';
    }

    return 'text-gray-400';
  }

  getSortIcon(column: DataTableColumn): string {
    if (this.sortColumn === column.key) {
      return this.sortDirection === 'asc'
        ? 'M5 15l7-7 7 7' // up arrow
        : 'M19 9l-7 7-7-7'; // down arrow
    }
    return 'M8 9l4-4 4 4m0 6l-4 4-4-4'; // up/down arrows
  }

  getActionButtonClasses(action: DataTableAction): string {
    const baseClasses =
      'px-2 py-1 text-xs font-medium rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors';

    switch (action.color) {
      case 'danger':
        return `${baseClasses} bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-300`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-300`;
    }
  }

  getBadgeClasses(value: string): string {
    // Common status mappings
    const statusClasses: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800',
      unsigned: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
    };

    const lowerValue = value?.toLowerCase();
    return statusClasses[lowerValue] || 'bg-gray-100 text-gray-800';
  }
}
