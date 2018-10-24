//------------------------------------------------------------------------------
// <auto-generated />
//
// This file was automatically generated by SWIG (http://www.swig.org).
// Version 3.0.12
//
// Do not make changes to this file unless you know what you are doing--modify
// the SWIG interface file instead.
//------------------------------------------------------------------------------


public class IVelocityControl : global::System.IDisposable {
  private global::System.Runtime.InteropServices.HandleRef swigCPtr;
  protected bool swigCMemOwn;

  internal IVelocityControl(global::System.IntPtr cPtr, bool cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = new global::System.Runtime.InteropServices.HandleRef(this, cPtr);
  }

  internal static global::System.Runtime.InteropServices.HandleRef getCPtr(IVelocityControl obj) {
    return (obj == null) ? new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero) : obj.swigCPtr;
  }

  ~IVelocityControl() {
    Dispose();
  }

  public virtual void Dispose() {
    lock(this) {
      if (swigCPtr.Handle != global::System.IntPtr.Zero) {
        if (swigCMemOwn) {
          swigCMemOwn = false;
          yarpPINVOKE.delete_IVelocityControl(swigCPtr);
        }
        swigCPtr = new global::System.Runtime.InteropServices.HandleRef(null, global::System.IntPtr.Zero);
      }
      global::System.GC.SuppressFinalize(this);
    }
  }

  public virtual bool getAxes(SWIGTYPE_p_int axes) {
    bool ret = yarpPINVOKE.IVelocityControl_getAxes__SWIG_0(swigCPtr, SWIGTYPE_p_int.getCPtr(axes));
    return ret;
  }

  public virtual bool velocityMove(int j, double sp) {
    bool ret = yarpPINVOKE.IVelocityControl_velocityMove__SWIG_0(swigCPtr, j, sp);
    return ret;
  }

  public virtual bool velocityMove(SWIGTYPE_p_double sp) {
    bool ret = yarpPINVOKE.IVelocityControl_velocityMove__SWIG_1(swigCPtr, SWIGTYPE_p_double.getCPtr(sp));
    return ret;
  }

  public virtual bool setRefAcceleration(int j, double acc) {
    bool ret = yarpPINVOKE.IVelocityControl_setRefAcceleration(swigCPtr, j, acc);
    return ret;
  }

  public virtual bool setRefAccelerations(SWIGTYPE_p_double accs) {
    bool ret = yarpPINVOKE.IVelocityControl_setRefAccelerations__SWIG_0(swigCPtr, SWIGTYPE_p_double.getCPtr(accs));
    return ret;
  }

  public virtual bool getRefAcceleration(int j, SWIGTYPE_p_double acc) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefAcceleration__SWIG_0(swigCPtr, j, SWIGTYPE_p_double.getCPtr(acc));
    return ret;
  }

  public virtual bool getRefAccelerations(SWIGTYPE_p_double accs) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefAccelerations__SWIG_0(swigCPtr, SWIGTYPE_p_double.getCPtr(accs));
    return ret;
  }

  public virtual bool stop(int j) {
    bool ret = yarpPINVOKE.IVelocityControl_stop__SWIG_0(swigCPtr, j);
    return ret;
  }

  public virtual bool stop() {
    bool ret = yarpPINVOKE.IVelocityControl_stop__SWIG_1(swigCPtr);
    return ret;
  }

  public virtual bool velocityMove(int n_joint, SWIGTYPE_p_int joints, SWIGTYPE_p_double spds) {
    bool ret = yarpPINVOKE.IVelocityControl_velocityMove__SWIG_2(swigCPtr, n_joint, SWIGTYPE_p_int.getCPtr(joints), SWIGTYPE_p_double.getCPtr(spds));
    return ret;
  }

  public virtual bool getRefVelocity(int joint, SWIGTYPE_p_double vel) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefVelocity(swigCPtr, joint, SWIGTYPE_p_double.getCPtr(vel));
    return ret;
  }

  public virtual bool getRefVelocities(SWIGTYPE_p_double vels) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefVelocities__SWIG_0(swigCPtr, SWIGTYPE_p_double.getCPtr(vels));
    return ret;
  }

  public virtual bool getRefVelocities(int n_joint, SWIGTYPE_p_int joints, SWIGTYPE_p_double vels) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefVelocities__SWIG_1(swigCPtr, n_joint, SWIGTYPE_p_int.getCPtr(joints), SWIGTYPE_p_double.getCPtr(vels));
    return ret;
  }

  public virtual bool setRefAccelerations(int n_joint, SWIGTYPE_p_int joints, SWIGTYPE_p_double accs) {
    bool ret = yarpPINVOKE.IVelocityControl_setRefAccelerations__SWIG_1(swigCPtr, n_joint, SWIGTYPE_p_int.getCPtr(joints), SWIGTYPE_p_double.getCPtr(accs));
    return ret;
  }

  public virtual bool getRefAccelerations(int n_joint, SWIGTYPE_p_int joints, SWIGTYPE_p_double accs) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefAccelerations__SWIG_1(swigCPtr, n_joint, SWIGTYPE_p_int.getCPtr(joints), SWIGTYPE_p_double.getCPtr(accs));
    return ret;
  }

  public virtual bool stop(int n_joint, SWIGTYPE_p_int joints) {
    bool ret = yarpPINVOKE.IVelocityControl_stop__SWIG_2(swigCPtr, n_joint, SWIGTYPE_p_int.getCPtr(joints));
    return ret;
  }

  public int getAxes() {
    int ret = yarpPINVOKE.IVelocityControl_getAxes__SWIG_1(swigCPtr);
    return ret;
  }

  public bool velocityMove(DVector data) {
    bool ret = yarpPINVOKE.IVelocityControl_velocityMove__SWIG_3(swigCPtr, DVector.getCPtr(data));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public bool setRefAccelerations(DVector data) {
    bool ret = yarpPINVOKE.IVelocityControl_setRefAccelerations__SWIG_2(swigCPtr, DVector.getCPtr(data));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public bool getRefAcceleration(int j, DVector data) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefAcceleration__SWIG_1(swigCPtr, j, DVector.getCPtr(data));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

  public bool getRefAccelerations(DVector data) {
    bool ret = yarpPINVOKE.IVelocityControl_getRefAccelerations__SWIG_2(swigCPtr, DVector.getCPtr(data));
    if (yarpPINVOKE.SWIGPendingException.Pending) throw yarpPINVOKE.SWIGPendingException.Retrieve();
    return ret;
  }

}
