//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class ICurrentControl : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal ICurrentControl(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(ICurrentControl obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~ICurrentControl() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_ICurrentControl(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public virtual bool getNumberOfMotors(SWIGTYPE_p_int ax) {
    bool ret = yarpPINVOKE.ICurrentControl_getNumberOfMotors(swigCPtr, SWIGTYPE_p_int.getCPtr(ax));
    return ret;
  }

  public virtual bool getCurrent(int m, SWIGTYPE_p_double curr) {
    bool ret = yarpPINVOKE.ICurrentControl_getCurrent(swigCPtr, m, SWIGTYPE_p_double.getCPtr(curr));
    return ret;
  }

  public virtual bool getCurrents(SWIGTYPE_p_double currs) {
    bool ret = yarpPINVOKE.ICurrentControl_getCurrents(swigCPtr, SWIGTYPE_p_double.getCPtr(currs));
    return ret;
  }

  public virtual bool getCurrentRange(int m, SWIGTYPE_p_double min, SWIGTYPE_p_double max) {
    bool ret = yarpPINVOKE.ICurrentControl_getCurrentRange(swigCPtr, m, SWIGTYPE_p_double.getCPtr(min), SWIGTYPE_p_double.getCPtr(max));
    return ret;
  }

  public virtual bool getCurrentRanges(SWIGTYPE_p_double min, SWIGTYPE_p_double max) {
    bool ret = yarpPINVOKE.ICurrentControl_getCurrentRanges(swigCPtr, SWIGTYPE_p_double.getCPtr(min), SWIGTYPE_p_double.getCPtr(max));
    return ret;
  }

  public virtual bool setRefCurrents(SWIGTYPE_p_double currs) {
    bool ret = yarpPINVOKE.ICurrentControl_setRefCurrents__SWIG_0(swigCPtr, SWIGTYPE_p_double.getCPtr(currs));
    return ret;
  }

  public virtual bool setRefCurrent(int m, double curr) {
    bool ret = yarpPINVOKE.ICurrentControl_setRefCurrent(swigCPtr, m, curr);
    return ret;
  }

  public virtual bool setRefCurrents(int n_motor, SWIGTYPE_p_int motors, SWIGTYPE_p_double currs) {
    bool ret = yarpPINVOKE.ICurrentControl_setRefCurrents__SWIG_1(swigCPtr, n_motor, SWIGTYPE_p_int.getCPtr(motors), SWIGTYPE_p_double.getCPtr(currs));
    return ret;
  }

  public virtual bool getRefCurrents(SWIGTYPE_p_double currs) {
    bool ret = yarpPINVOKE.ICurrentControl_getRefCurrents(swigCPtr, SWIGTYPE_p_double.getCPtr(currs));
    return ret;
  }

  public virtual bool getRefCurrent(int m, SWIGTYPE_p_double curr) {
    bool ret = yarpPINVOKE.ICurrentControl_getRefCurrent(swigCPtr, m, SWIGTYPE_p_double.getCPtr(curr));
    return ret;
  }

}
