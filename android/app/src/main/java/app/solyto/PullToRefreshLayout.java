package app.solyto;

import android.content.Context;
import android.view.MotionEvent;
import androidx.annotation.NonNull;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

/**
 * SwipeRefreshLayout that tells the gate when a new touch starts.
 *
 * On ACTION_DOWN the page has not seen the touch yet, so the gate cannot know
 * whether a pull is allowed. The down event is always let through (so the
 * layout records the start position); the decision is made on the following
 * move events, once the page has answered.
 */
class PullToRefreshLayout extends SwipeRefreshLayout {

    interface Gate {
        void onTouchDown();

        boolean canContentScrollUp();
    }

    private Gate gate;
    private boolean handlingDown = false;

    PullToRefreshLayout(@NonNull Context context) {
        super(context);
        setOnChildScrollUpCallback((parent, child) ->
                !handlingDown && gate != null && gate.canContentScrollUp());
    }

    void setGate(Gate gate) {
        this.gate = gate;
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        if (ev.getActionMasked() != MotionEvent.ACTION_DOWN) {
            return super.onInterceptTouchEvent(ev);
        }
        if (gate != null) gate.onTouchDown();
        handlingDown = true;
        try {
            return super.onInterceptTouchEvent(ev);
        } finally {
            handlingDown = false;
        }
    }
}
