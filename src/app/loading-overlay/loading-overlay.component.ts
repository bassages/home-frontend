import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'home-loading-overlay',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="loading-overlay" role="status" aria-live="polite" aria-label="Bezig met laden">
      <div class="clock" aria-hidden="true">
        <span class="hand hour"></span>
        <span class="hand minute"></span>
        <span class="center-dot"></span>
      </div>
      <div class="loading-text">Een moment a.u.b.</div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background-color: rgba(51, 51, 51, 0.8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
      color: #fff;
      font-weight: bold;
    }

    .clock {
      position: relative;
      width: 72px;
      height: 72px;
      border: 4px solid #f4b649;
      border-radius: 50%;
      animation: pulse 1.8s ease-in-out infinite;
    }

    .hand {
      position: absolute;
      left: 50%;
      bottom: 50%;
      width: 3px;
      transform-origin: bottom center;
      background-color: #f4b649;
      border-radius: 2px;
    }

    .hour {
      height: 18px;
      animation: spin 12s linear infinite;
    }

    .minute {
      height: 26px;
      animation: spin 2s linear infinite;
    }

    .center-dot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 8px;
      height: 8px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background-color: #f4b649;
    }

    .loading-text {
      font-size: 1rem;
    }

    @keyframes spin {
      from {
        transform: translateX(-50%) rotate(0deg);
      }
      to {
        transform: translateX(-50%) rotate(360deg);
      }
    }

    @keyframes pulse {
      0%,
      100% {
        box-shadow: 0 0 0 0 rgba(244, 182, 73, 0.5);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(244, 182, 73, 0);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingOverlayComponent {
  private readonly spinnerService = inject(NgxSpinnerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly visible = signal(false);

  public constructor() {
    this.spinnerService
      .getSpinner('primary')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((spinner) => this.visible.set(Boolean(spinner.show)));
  }
}


