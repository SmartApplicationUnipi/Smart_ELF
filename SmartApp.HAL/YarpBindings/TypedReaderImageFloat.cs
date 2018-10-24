//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class TypedReaderImageFloat : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal TypedReaderImageFloat(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(TypedReaderImageFloat obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~TypedReaderImageFloat() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_TypedReaderImageFloat(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public new void setStrict(bool strict) {
    yarpPINVOKE.TypedReaderImageFloat_setStrict__SWIG_0(swigCPtr, strict);
  }

  public new void setStrict() {
    yarpPINVOKE.TypedReaderImageFloat_setStrict__SWIG_1(swigCPtr);
  }

  public new ImageFloat read(bool shouldWait) {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageFloat_read__SWIG_0(swigCPtr, shouldWait);
    ImageFloat ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageFloat(cPtr, false);
    return ret;
  }

  public new ImageFloat read() {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageFloat_read__SWIG_1(swigCPtr);
    ImageFloat ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageFloat(cPtr, false);
    return ret;
  }

  public virtual void interrupt() {
    yarpPINVOKE.TypedReaderImageFloat_interrupt(swigCPtr);
  }

  public new ImageFloat lastRead() {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageFloat_lastRead(swigCPtr);
    ImageFloat ret = (cPtr == global::System.IntPtr.Zero) ? null : new ImageFloat(cPtr, false);
    return ret;
  }

  public new bool isClosed() {
    bool ret = yarpPINVOKE.TypedReaderImageFloat_isClosed(swigCPtr);
    return ret;
  }

  public new void useCallback(TypedReaderCallbackImageFloat callback) {
    yarpPINVOKE.TypedReaderImageFloat_useCallback(swigCPtr, TypedReaderCallbackImageFloat.getCPtr(callback));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public virtual void disableCallback() {
    yarpPINVOKE.TypedReaderImageFloat_disableCallback(swigCPtr);
  }

  public new int getPendingReads() {
    int ret = yarpPINVOKE.TypedReaderImageFloat_getPendingReads(swigCPtr);
    return ret;
  }

  public virtual string getName() {
    string ret = yarpPINVOKE.TypedReaderImageFloat_getName(swigCPtr);
    return ret;
  }

  public new void setReplier(PortReader reader) {
    yarpPINVOKE.TypedReaderImageFloat_setReplier(swigCPtr, PortReader.getCPtr(reader));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
  }

  public virtual SWIGTYPE_p_void acquire() {
    global::System.IntPtr cPtr = yarpPINVOKE.TypedReaderImageFloat_acquire(swigCPtr);
    SWIGTYPE_p_void ret = (cPtr == global::System.IntPtr.Zero) ? null : new SWIGTYPE_p_void(cPtr, false);
    return ret;
  }

  public virtual void release(SWIGTYPE_p_void handle) {
    yarpPINVOKE.TypedReaderImageFloat_release(swigCPtr, SWIGTYPE_p_void.getCPtr(handle));
  }

  public new void setTargetPeriod(double period) {
    yarpPINVOKE.TypedReaderImageFloat_setTargetPeriod(swigCPtr, period);
  }

}
