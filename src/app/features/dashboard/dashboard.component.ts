import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Welcome to ZapSign Document Management</p>
      </div>

      <div class="dashboard-grid">
        <mat-card class="dashboard-card stats-card">
          <mat-card-header>
            <mat-card-title>
              
              Documents
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">24</div>
            <div class="stat-label">Total Documents</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card stats-card">
          <mat-card-header>
            <mat-card-title>
              
              Pending
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">7</div>
            <div class="stat-label">Awaiting Signatures</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card stats-card">
          <mat-card-header>
            <mat-card-title>
              
              Completed
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">17</div>
            <div class="stat-label">Signed Documents</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card stats-card">
          <mat-card-header>
            <mat-card-title>
              
              Companies
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-number">5</div>
            <div class="stat-label">Active Companies</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="dashboard-actions">
        <mat-card class="dashboard-card action-card">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-raised-button color="primary" class="action-button">
                
                Create Document
              </button>
              <button mat-raised-button color="accent" class="action-button">
                
                Add Company
              </button>
              <button mat-raised-button class="action-button">
                
                Add Signer
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card recent-card">
          <mat-card-header>
            <mat-card-title>Recent Activity</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <mat-list class="activity-list">
              <mat-list-item>
                
                <div matListItemTitle>Contract Agreement</div>
                <div matListItemLine>Created 2 hours ago</div>
              </mat-list-item>
              <mat-divider></mat-divider>
              <mat-list-item>
                
                <div matListItemTitle>NDA Document</div>
                <div matListItemLine>Signed by John Doe</div>
              </mat-list-item>
              <mat-divider></mat-divider>
              <mat-list-item>
                
                <div matListItemTitle>TechCorp Inc.</div>
                <div matListItemLine>Company added yesterday</div>
              </mat-list-item>
            </mat-list>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
    }

    .dashboard-title {
      font-size: 32px;
      font-weight: 300;
      margin: 0 0 8px 0;
      color: var(--text-primary);
    }

    .dashboard-subtitle {
      font-size: 16px;
      color: var(--text-secondary);
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .dashboard-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .dashboard-card {
      height: fit-content;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-large);
      }
    }

    .stats-card {
      .mat-card-header {
        padding-bottom: 8px;
      }

      .mat-card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
      }

      .mat-card-content {
        text-align: center;
        padding-top: 8px;
      }
    }

    .stat-number {
      font-size: 36px;
      font-weight: 300;
      color: var(--primary-color);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    .action-card {
      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .action-button {
        justify-content: flex-start;
        gap: 8px;
      }
    }

    .recent-card {
      .activity-list {
        padding: 0;
      }

      .mat-list-item {
        min-height: 60px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }

      .dashboard-actions {
        gap: 16px;
      }

      .dashboard-title {
        font-size: 28px;
      }
    }

    @media (max-width: 480px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .action-card .action-buttons {
        gap: 8px;
      }
    }
  `]
})
export class DashboardComponent {
  constructor() {}
}